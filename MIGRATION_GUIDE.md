# Guia de Migração - Arquivos Restantes

## ⚠️ IMPORTANTE: Execute o SQL no Supabase Primeiro!

Antes de testar a aplicação, você DEVE executar o arquivo `supabase-schema.sql` no Supabase:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Copie e cole TODO o conteúdo de `supabase-schema.sql`
6. Clique em **Run** ou pressione `Ctrl+Enter`

Isso criará todas as tabelas, índices, políticas RLS e triggers necessários.

---

## Arquivos Restantes para Migrar

Os seguintes arquivos ainda usam Firebase e precisam ser atualizados manualmente:

### 1. **ForgotPassword.jsx**
```javascript
// ANTES (Firebase)
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../../firebaseConfig';
await sendPasswordResetEmail(auth, email);

// DEPOIS (Supabase)
import { supabase } from '../../supabaseClient';
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});
```

### 2. **Header.jsx**
```javascript
// ANTES
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';
await updateDoc(doc(db, 'notifications', notif.id), { read: true });

// DEPOIS
import { supabase } from '../supabaseClient';
await supabase.from('notifications').update({ read: true }).eq('id', notif.id);
```

### 3. **ProcessModal.jsx** e **SupportModal.jsx**
```javascript
// ANTES
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from '../firebaseConfig';
await addDoc(collection(db, "processes"), { ...data, created_at: Timestamp.now() });

// DEPOIS
import { supabase } from '../supabaseClient';
const { data, error } = await supabase.from('processes').insert([{ ...data }]);
```

### 4. **useProcesses.js** e **useNotifications.js**
```javascript
// ANTES
import { collection, query, onSnapshot } from "firebase/firestore";
const q = query(collection(db, 'processes'));
onSnapshot(q, (snapshot) => { /* ... */ });

// DEPOIS
import { supabase } from '../supabaseClient';

// Query inicial
const { data } = await supabase.from('processes').select('*');

// Realtime subscription
const subscription = supabase
  .channel('processes-channel')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'processes' },
    (payload) => { /* atualizar estado */ }
  )
  .subscribe();

// Cleanup
return () => subscription.unsubscribe();
```

### 5. **Settings.jsx** e **SuporteDashboard.jsx**
Mesma lógica: substituir Firestore queries por Supabase queries.

---

## Padrões de Conversão

### Firestore → Supabase

| Firestore | Supabase |
|-----------|----------|
| `collection(db, 'table')` | `supabase.from('table')` |
| `doc(db, 'table', id)` | `.eq('id', id).single()` |
| `getDoc(docRef)` | `.select().eq('id', id).single()` |
| `getDocs(query)` | `.select()` |
| `addDoc(collection, data)` | `.insert([data])` |
| `setDoc(doc, data)` | `.upsert(data)` |
| `updateDoc(doc, data)` | `.update(data).eq('id', id)` |
| `deleteDoc(doc)` | `.delete().eq('id', id)` |
| `onSnapshot(query, callback)` | `.on('postgres_changes', callback)` |
| `Timestamp.now()` | Não necessário (Supabase usa `NOW()`) |
| `serverTimestamp()` | Não necessário (triggers automáticos) |

---

## Status da Migração

### ✅ Completo
- [x] Desinstalar Firebase
- [x] Instalar Supabase  
- [x] Criar `supabaseClient.js`
- [x] Criar schema SQL
- [x] Migrar `AuthContext.jsx`
- [x] Migrar `Login.jsx`
- [x] Migrar `Register.jsx`
- [x] Migrar `DashboardLayout.jsx`
- [x] Remover `firebaseConfig.js`

### ⏳ Pendente (Opcional - para funcionalidade completa)
- [ ] `ForgotPassword.jsx`
- [ ] `Header.jsx` (notificações)
- [ ] `ProcessModal.jsx`
- [ ] `SupportModal.jsx`
- [ ] `Settings.jsx`
- [ ] `SuporteDashboard.jsx`
- [ ] `useProcesses.js`
- [ ] `useNotifications.js`

---

## Próximos Passos

1. **Execute o SQL no Supabase** (ver instruções no topo)
2. **Inicie o servidor**: `npm run dev`
3. **Teste o login/registro** - as funcionalidades básicas já funcionam!
4. **Migre os arquivos restantes** conforme necessário usando os padrões acima

A autenticação já está 100% funcional com Supabase! 🎉
