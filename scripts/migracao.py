import os
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURAÇÃO INICIAL ---
# Carrega as variáveis do arquivo .env
load_dotenv()

URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_KEY")

if not URL or not KEY:
    raise ValueError("❌ Erro: SUPABASE_URL e SUPABASE_KEY precisam estar no arquivo .env")

# Inicializa o cliente Supabase
supabase: Client = create_client(URL, KEY)

def limpar_texto(texto):
    """Remove espaços extras e converte para maiúsculas. Retorna None se vazio."""
    if pd.isna(texto) or str(texto).strip() == "":
        return None
    return str(texto).strip().upper()

def get_or_create_processo(nome_processo):
    """
    Busca um processo pelo nome. Se não existir, cria um novo.
    Retorna o ID do processo.
    """
    print(f"🔍 Verificando processo: '{nome_processo}'...")
    
    # 1. Tenta buscar
    try:
        response = supabase.table('processos').select('id').eq('nome', nome_processo).execute()
        if response.data:
            print(f"✅ Processo encontrado. ID: {response.data[0]['id']}")
            return response.data[0]['id']
        
        # 2. Se não existir, cria
        print("⚡ Processo não encontrado. Criando novo...")
        novo_processo = {
            "nome": nome_processo,
            "status": "Planejamento",
            "descricao": "Importado via script de migração"
        }
        response = supabase.table('processos').insert(novo_processo).select().execute()
        
        if response.data:
            print(f"✅ Processo criado com sucesso. ID: {response.data[0]['id']}")
            return response.data[0]['id']
            
    except Exception as e:
        print(f"❌ Erro ao gerenciar processo: {e}")
        return None

def migrar_vagas(processo_id, arquivo_csv):
    print(f"\n📂 Iniciando migração de VAGAS para o Processo ID {processo_id}...")
    
    if not os.path.exists(arquivo_csv):
        print(f"❌ Arquivo não encontrado: {arquivo_csv}")
        return

    try:
        df = pd.read_csv(arquivo_csv)
        vagas_para_inserir = []
        
        for _, row in df.iterrows():
            # Mapeamento e limpeza
            municipio = limpar_texto(row.get('MUNICIPIO'))
            cargo = limpar_texto(row.get('CARGO') or row.get('CARGO/FUNÇÃO'))
            
            # Pula linhas sem dados essenciais
            if not municipio or not cargo:
                continue

            vaga = {
                "processo_id": processo_id,
                "municipio": municipio,
                "dre": limpar_texto(row.get('DRE')),
                "cargo": cargo,
                "escola_lotacao": limpar_texto(row.get('LOTAÇÃO') or row.get('ÚLTIMA LOTAÇÃO?')),
                "status": 'OCUPADA' if limpar_texto(row.get('STATUS')) == 'ATIVO' else 'ABERTA',
                "observacao": limpar_texto(row.get('OBSERVAÇÃO'))
            }
            vagas_para_inserir.append(vaga)

        # Inserção em lotes (Batch) para evitar timeout
        batch_size = 100
        for i in range(0, len(vagas_para_inserir), batch_size):
            batch = vagas_para_inserir[i:i + batch_size]
            supabase.table('vagas').insert(batch).execute()
            print(f"   ↳ Inserido lote {i} a {i + len(batch)}...")

        print(f"✅ Sucesso! Total de {len(vagas_para_inserir)} vagas migradas.")

    except Exception as e:
        print(f"❌ Erro crítico na migração de vagas: {e}")

def migrar_candidatos(processo_id, arquivo_csv):
    print(f"\n📂 Iniciando migração de CANDIDATOS para o Processo ID {processo_id}...")
    
    if not os.path.exists(arquivo_csv):
        print(f"❌ Arquivo não encontrado: {arquivo_csv}")
        return

    try:
        df = pd.read_csv(arquivo_csv)
        candidatos_para_inserir = []

        for _, row in df.iterrows():
            nome = limpar_texto(row.get('CANDIDATO') or row.get('NOME'))
            cpf = limpar_texto(row.get('CPF'))
            
            if not nome: 
                continue

            candidato = {
                "processo_id": processo_id,
                "nome": nome,
                "cpf": cpf if cpf else "N/A", # Evita erro de constraint se não tiver CPF
                "municipio_inscricao": limpar_texto(row.get('MUNICIPIO')),
                "cargo_pretendido": limpar_texto(row.get('CARGO')),
                "status": 'Classificado', # Assumindo padrão para importação
                "email": limpar_texto(row.get('EMAIL')),
                "telefone": limpar_texto(row.get('TELEFONE'))
            }
            candidatos_para_inserir.append(candidato)
        
        # Inserção em lotes
        batch_size = 100
        for i in range(0, len(candidatos_para_inserir), batch_size):
            batch = candidatos_para_inserir[i:i + batch_size]
            try:
                supabase.table('candidatos').insert(batch).execute()
                print(f"   ↳ Inserido lote {i} a {i + len(batch)}...")
            except Exception as e:
                print(f"   ⚠️ Erro no lote {i}: {e}")

        print(f"✅ Sucesso! Total de {len(candidatos_para_inserir)} candidatos migrados.")

    except Exception as e:
        print(f"❌ Erro crítico na migração de candidatos: {e}")

# --- EXECUÇÃO ---
if __name__ == "__main__":
    # 1. Defina o nome do Processo que será criado/buscado
    NOME_DO_PROCESSO = "PSS 01/2025 - PROCESSO UNIFICADO"
    
    # 2. Obtém o ID
    id_processo = get_or_create_processo(NOME_DO_PROCESSO)
    
    if id_processo:
        # 3. Roda as migrações (ajuste os nomes dos arquivos CSV conforme necessário)
        # migrar_vagas(id_processo, 'dados_vagas.csv')
        # migrar_candidatos(id_processo, 'dados_candidatos.csv')
        pass
    else:
        print("❌ Não foi possível obter um ID de processo válido. Abortando.")