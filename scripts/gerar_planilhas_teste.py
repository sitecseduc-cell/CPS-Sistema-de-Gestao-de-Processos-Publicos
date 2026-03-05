import pandas as pd
import random
import os

# Garantir que a pasta onde vamos salvar os arquivos existe
os.makedirs("test_data", exist_ok=True)

# ─── Configurações Básicas ────────────────────────────────────────────────────────
MUNICIPIOS_EXCLUIDOS = ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Abaetetuba', 'Barcarena', 'Benevides']
MUNICIPIOS_INTERIOR = ['Castanhal', 'Cametá', 'Bragança', 'Tucuruí', 'Paragominas', 'Itaituba', 'Breves', 'Altamira', 'Redenção', 'Oriximiná', 'Tailândia', 'Moju', 'Novo Repartimento', 'Capanema', 'Santa Izabel do Pará']

TAGS_EXCLUSAO = ['Indígena', 'Quilombola', 'CEEJA', 'SOME', 'Antonio Carlos']
TAGS_COMUNS = ['Estadual', 'Padre', 'Professora', 'Doutor', 'São', 'Santa']

DRES = ['DRE 1', 'DRE 2', 'DRE 3', 'DRE 4', 'DRE 5']

def gerar_nome_escola(tipo):
    """Gera um nome de escola baseado no tipo (Comum ou Excluída)."""
    if tipo == 'excluida':
        tag = random.choice(TAGS_EXCLUSAO)
        return f"Escola {tag} {random.choice(['da Aldeia', 'do Rio', 'Central', 'Nova', 'Esperança'])} {random.randint(1, 100)}"
    else:
        tag = random.choice(TAGS_COMUNS)
        return f"EEEM {tag} {random.choice(['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues'])} {random.randint(1, 500)}"

def gerar_planilha(nome_arquivo, num_linhas, prob_exclusao_municipio, prob_exclusao_nome, prob_zero_alunos):
    """
    Gera um DataFrame e salva como Excel.
    """
    dados = []
    
    for i in range(num_linhas):
        # 1. Definir Município
        if random.random() < prob_exclusao_municipio:
            municipio = random.choice(MUNICIPIOS_EXCLUIDOS)
        else:
            municipio = random.choice(MUNICIPIOS_INTERIOR)
            
        # 2. Definir Nome (comum ou com tag de exclusão)
        if random.random() < prob_exclusao_nome:
            nome = gerar_nome_escola('excluida')
        else:
            nome = gerar_nome_escola('comum')
            
        # 3. Definir Alunos
        if random.random() < prob_zero_alunos:
            alunos = 0
        else:
            # Distribuições de Alunos: 
            # 50% Pequenas (1 - 700)
            # 30% Médias (701 - 999)
            # 20% Grandes (1000 - 3500)
            rand_aluno = random.random()
            if rand_aluno < 0.5:
                alunos = random.randint(50, 700)
            elif rand_aluno < 0.8:
                alunos = random.randint(701, 999)
            else:
                alunos = random.randint(1000, 3500)
                
        # 4. Definir Localização
        localizacao = random.choice(['Urbana', 'Rural'])
        
        # 5. DRE
        dre = random.choice(DRES)
        
        dados.append({
            'Escola': nome,
            'Municipio': municipio,
            'DRE': dre,
            'Localizacao': localizacao,
            'Total Alunos': alunos
        })
        
    df = pd.DataFrame(dados)
    
    # Salvar
    caminho = os.path.join("test_data", nome_arquivo)
    df.to_excel(caminho, index=False)
    print(f"Planilha '{nome_arquivo}' gerada com {num_linhas} registros.")

# ─── Geração das 3 Planilhas ──────────────────────────────────────────────────

# Planilha 1: Pequena (Cenário Ideal Simples)
# Poucas exclusões gerais para ver o ranking limpo
gerar_planilha("Teste1_Cenario_Ideal.xlsx", num_linhas=150, prob_exclusao_municipio=0.05, prob_exclusao_nome=0.05, prob_zero_alunos=0.02)

# Planilha 2: Média (Cenário Realista Misturado)
# Proporção realista de metrópoles, indígenas/quilombolas
gerar_planilha("Teste2_Realista_Misturado.xlsx", num_linhas=600, prob_exclusao_municipio=0.20, prob_exclusao_nome=0.15, prob_zero_alunos=0.05)

# Planilha 3: Grande (Teste de Stress e Regras)
# Muitas escolas grandes, alto indíce de escolas zero alunos, muitos rurais
gerar_planilha("Teste3_Stress_Regras.xlsx", num_linhas=2500, prob_exclusao_municipio=0.30, prob_exclusao_nome=0.25, prob_zero_alunos=0.10)

print("Processo finalizado!")
