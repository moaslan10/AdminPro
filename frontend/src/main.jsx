import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');
const getToken = () => localStorage.getItem('ap_token');
const getUser = () => JSON.parse(localStorage.getItem('ap_user') || 'null');

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${path}`, { ...options, headers });
  if (response.status === 401) {
    localStorage.clear();
    window.location.reload();
    throw new Error('Session expired.');
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text.replace(/^"|"$/g, '') || 'Request failed');
  }
  return response.status === 204 ? null : response.json();
}

const labels = {
  dashboard: 'Dashboard', users: 'Users', departments: 'Departments',
  employees: 'Employees', tasks: 'Tasks', logs: 'Activity Logs', profile: 'My Profile'
};

function App() {
  const [user, setUser] = useState(getUser());
  const [page, setPage] = useState(getToken() ? 'dashboard' : 'login');
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const admin = user?.role === 'Admin' || user?.Role === 'Admin';

  if (page === 'login') {
    return <Login onLogin={(u) => { setUser(u); setPage('dashboard'); }} />;
  }

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setPage('login');
  };

  return (
    <div className="shell">
      <Sidebar page={page} setPage={setPage} admin={admin} logout={logout} />
      <main>
        <header>
          <div>
            <b>{labels[page]}</b>
            <small>{user?.name || user?.Name} · {user?.role || user?.Role}</small>
          </div>
          <button className="refresh" onClick={() => setRefresh(v => v + 1)}>↻ Refresh</button>
        </header>
        {error && <div className="error">{error}<button onClick={() => setError('')}>×</button></div>}
        <Page page={page} admin={admin} user={user} refresh={refresh} setError={setError} />
      </main>
    </div>
  );
}

function Sidebar({ page, setPage, admin, logout }) {
  const items = ['dashboard', 'users', 'departments', 'employees', 'tasks', 'logs', 'profile'];
  return (
    <aside>
      <div className="brand">
        <div className="mark">AP</div>
        <div><h1>AdminPro</h1><span>Management System</span></div>
      </div>
      <nav>
        {items.map(item => {
          if ((item === 'users' || item === 'logs') && !admin) return null;
          return <button key={item} className={page === item ? 'active' : ''} onClick={() => setPage(item)}>{icon(item)} {labels[item]}</button>;
        })}
      </nav>
      <button className="logout" onClick={logout}>↪ Logout</button>
    </aside>
  );
}

function icon(name) {
  return { dashboard: '⌂', users: '♙', departments: '▤', employees: '♟', tasks: '✓', logs: '◷', profile: '◎' }[name] || '•';
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@adminpro.com');
  const [password, setPassword] = useState('123456');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error('Invalid email or password');
      const data = await response.json();
      localStorage.setItem('ap_token', data.token);
      localStorage.setItem('ap_user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (e) {
      setError(e.message || 'Failed to fetch');
    } finally { setBusy(false); }
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="mark big">AP</div>
        <div className="eyebrow">SECURE ACCESS</div>
        <h2>Welcome back</h2>
        <p>Sign in to your organization control center.</p>
        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" />
        <label>Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" />
        {error && <div className="error">{error}</div>}
        <button className="primary full" disabled={busy}>{busy ? 'Signing in…' : 'Login'}</button>
        <div className="hint">Admin: admin@adminpro.com / 123456<br />Employee: employee@adminpro.com / 123456</div>
      </form>
    </div>
  );
}

function Page({ page, admin, user, refresh, setError }) {
  if (page === 'dashboard') return <Dashboard refresh={refresh} />;
  if (page === 'users') return <Users refresh={refresh} admin={admin} setError={setError} />;
  if (page === 'departments') return <Departments refresh={refresh} admin={admin} setError={setError} />;
  if (page === 'employees') return <Employees refresh={refresh} admin={admin} setError={setError} />;
  if (page === 'tasks') return <Tasks refresh={refresh} admin={admin} setError={setError} />;
  if (page === 'logs') return <Logs refresh={refresh} />;
  return <Profile user={user} setError={setError} />;
}

function useData(path, refresh) {
  const [data, setData] = useState([]);
  useEffect(() => {
    let active = true;
    api(path).then(value => { if (active) setData(value); }).catch(() => {}).finally(() => {});
    return () => { active = false; };
  }, [path, refresh]);
  return [data, setData];
}

function Dashboard({ refresh }) {
  const [data] = useData('/dashboard', refresh);
  const cards = [
    ['Users', data.users], ['Departments', data.departments], ['Employees', data.employees],
    ['Tasks', data.tasks], ['Overdue', data.overdueTasks]
  ];
  return (
    <>
      <section className="hero"><div className="eyebrow">CONTROL CENTER</div><h2>Organization Dashboard</h2><p>One place to manage people, departments and work.</p></section>
      <div className="stats">{cards.map(([name, value]) => <div className="stat" key={name}><small>{name}</small><b>{value ?? 0}</b></div>)}</div>
      <div className="grid2">
        <div className="panel"><h3>Task progress</h3><Bar name="Pending" value={data.pendingTasks} /><Bar name="In Progress" value={data.inProgressTasks} /><Bar name="Done" value={data.completedTasks} /></div>
        <div className="panel"><h3>Portfolio checklist</h3><div className="checks"><span>✓ JWT authentication</span><span>✓ Role-based access</span><span>✓ CRUD management</span><span>✓ Responsive UI</span><span>✓ Activity logging</span></div></div>
      </div>
    </>
  );
}

function Bar({ name, value = 0 }) {
  const width = Math.min((value || 0) * 15, 100);
  return <div className="bar"><div><span>{name}</span><b>{value || 0}</b></div><div className="track"><i style={{ width: `${width}%` }} /></div></div>;
}

function Frame({ title, action, search, setSearch, children }) {
  return (
    <><section className="hero compact"><div className="eyebrow">MANAGEMENT</div><div className="title-row"><div><h2>{title}</h2><p>Search, filter and manage records.</p></div>{action}</div></section>
      <section className="panel">{setSearch && <input className="search" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />}{children}</section></>
  );
}

function Users({ refresh, admin, setError }) {
  const [items, reload] = useData('/users', refresh); const [query, setQuery] = useState(''); const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '123456', role: 'Employee', isActive: true });
  const rows = items.filter(x => `${x.name}${x.email}${x.role}`.toLowerCase().includes(query.toLowerCase()));
  const save = async () => { try { await api(editing ? `/users/${editing}` : '/users', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) }); setEditing(null); reload(); } catch (e) { setError(e.message); } };
  const remove = async id => { try { await api(`/users/${id}`, { method: 'DELETE' }); reload(); } catch (e) { setError(e.message); } };
  return <Frame title="Users" search={query} setSearch={setQuery} action={admin && <button className="primary" onClick={() => { setEditing(0); setForm({ name: '', email: '', password: '123456', role: 'Employee', isActive: true }); }}>+ Add User</button>}><Table cols={['Name','Email','Role','Status','Actions']} rows={rows.map(x => [x.name,x.email,<Badge t={x.role}/>,<Badge t={x.isActive ? 'Active' : 'Disabled'}/>,<Actions edit={() => { setEditing(x.id); setForm({ name:x.name,email:x.email,password:'',role:x.role,isActive:x.isActive }); }} del={admin ? () => remove(x.id) : null} />])}/>{editing !== null && <Modal title={editing ? 'Edit User' : 'Add User'} form={form} setForm={setForm} fields={['name','email','password']} extra={<><select value={form.role} onChange={e => setForm({...form, role:e.target.value})}><option>Employee</option><option>Admin</option></select><label className="check"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form,isActive:e.target.checked})}/> Active</label></>} save={save} close={() => setEditing(null)} />}</Frame>;
}

function Departments({ refresh, admin, setError }) {
  const [items, reload] = useData('/departments', refresh); const [query, setQuery] = useState(''); const [editing, setEditing] = useState(null); const [form, setForm] = useState({ name:'', description:'' });
  const rows = items.filter(x => `${x.name}${x.description}`.toLowerCase().includes(query.toLowerCase()));
  const save = async () => { try { await api(editing ? `/departments/${editing}` : '/departments', { method:editing?'PUT':'POST', body:JSON.stringify(form) }); setEditing(null); reload(); } catch(e){setError(e.message);} };
  return <Frame title="Departments" search={query} setSearch={setQuery} action={admin && <button className="primary" onClick={()=>{setEditing(0);setForm({name:'',description:''});}}>+ Add Department</button>}><Table cols={['Name','Description','Employees','Actions']} rows={rows.map(x=>[x.name,x.description,x.employees,<Actions edit={()=>{setEditing(x.id);setForm({name:x.name,description:x.description});}} del={admin?async()=>{try{await api(`/departments/${x.id}`,{method:'DELETE'});reload();}catch(e){setError(e.message);}}:null}/>])}/>{editing!==null&&<Modal title={editing?'Edit Department':'Add Department'} form={form} setForm={setForm} fields={['name','description']} save={save} close={()=>setEditing(null)}/>}</Frame>;
}

function Employees({ refresh, admin, setError }) {
  const [items,reload]=useData('/employees',refresh); const [deps]=useData('/departments',refresh); const [query,setQuery]=useState(''); const [editing,setEditing]=useState(null); const [form,setForm]=useState({name:'',email:'',phone:'',jobTitle:'',departmentId:'',isActive:true});
  const rows=items.filter(x=>`${x.name}${x.email}${x.jobTitle}${x.department}`.toLowerCase().includes(query.toLowerCase()));
  const save=async()=>{try{await api(editing?`/employees/${editing}`:'/employees',{method:editing?'PUT':'POST',body:JSON.stringify({...form,departmentId:form.departmentId?Number(form.departmentId):null})});setEditing(null);reload();}catch(e){setError(e.message);}};
  return <Frame title="Employees" search={query} setSearch={setQuery} action={admin&&<button className="primary" onClick={()=>{setEditing(0);setForm({name:'',email:'',phone:'',jobTitle:'',departmentId:'',isActive:true});}}>+ Add Employee</button>}><Table cols={['Name','Job Title','Email','Department','Status','Actions']} rows={rows.map(x=>[x.name,x.jobTitle,x.email,x.department,<Badge t={x.isActive?'Active':'Disabled'}/>,<Actions edit={()=>{setEditing(x.id);setForm({name:x.name,email:x.email,phone:x.phone,jobTitle:x.jobTitle,departmentId:x.departmentId||'',isActive:x.isActive});}} del={admin?async()=>{try{await api(`/employees/${x.id}`,{method:'DELETE'});reload();}catch(e){setError(e.message);}}:null}/>])}/>{editing!==null&&<Modal title={editing?'Edit Employee':'Add Employee'} form={form} setForm={setForm} fields={['name','email','phone','jobTitle']} extra={<><select value={form.departmentId} onChange={e=>setForm({...form,departmentId:e.target.value})}><option value="">No Department</option>{deps.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select><label className="check"><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})}/> Active</label></>} save={save} close={()=>setEditing(null)}/>}</Frame>;
}

function Tasks({ refresh, admin, setError }) {
  const [items,reload]=useData('/tasks',refresh); const [employees]=useData('/employees',refresh); const [departments]=useData('/departments',refresh); const [query,setQuery]=useState(''); const [editing,setEditing]=useState(null); const [form,setForm]=useState({title:'',description:'',status:'Pending',priority:'Medium',dueDate:'',assigneeId:'',departmentId:''});
  const rows=items.filter(x=>`${x.title}${x.status}${x.priority}${x.assignee}${x.department}`.toLowerCase().includes(query.toLowerCase()));
  const save=async()=>{try{await api(editing?`/tasks/${editing}`:'/tasks',{method:editing?'PUT':'POST',body:JSON.stringify({...form,dueDate:form.dueDate?new Date(form.dueDate).toISOString():null,assigneeId:form.assigneeId?Number(form.assigneeId):null,departmentId:form.departmentId?Number(form.departmentId):null})});setEditing(null);reload();}catch(e){setError(e.message);}};
  return <Frame title="Tasks" search={query} setSearch={setQuery} action={admin&&<button className="primary" onClick={()=>{setEditing(0);setForm({title:'',description:'',status:'Pending',priority:'Medium',dueDate:'',assigneeId:'',departmentId:''});}}>+ Add Task</button>}><Table cols={['Task','Priority','Status','Assignee','Due','Actions']} rows={rows.map(x=>[<><b>{x.title}</b><small className="sub">{x.description}</small></>,<Badge t={x.priority}/>,<Badge t={x.status}/>,x.assignee,x.dueDate?new Date(x.dueDate).toLocaleDateString():'—',<Actions edit={()=>{setEditing(x.id);setForm({title:x.title,description:x.description,status:x.status,priority:x.priority,dueDate:x.dueDate?String(x.dueDate).slice(0,10):'',assigneeId:x.assigneeId||'',departmentId:x.departmentId||''});}} del={admin?async()=>{try{await api(`/tasks/${x.id}`,{method:'DELETE'});reload();}catch(e){setError(e.message);}}:null}/>])}/>{editing!==null&&<Modal title={editing?'Edit Task':'Add Task'} form={form} setForm={setForm} fields={['title','description']} extra={<><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Pending</option><option>In Progress</option><option>Done</option></select><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select><select value={form.assigneeId} onChange={e=>setForm({...form,assigneeId:e.target.value})}><option value="">Unassigned</option>{employees.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select><select value={form.departmentId} onChange={e=>setForm({...form,departmentId:e.target.value})}><option value="">No Department</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select><input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></>} save={save} close={()=>setEditing(null)}/>}</Frame>;
}

function Logs({refresh}) { const [items]=useData('/logs',refresh); return <Frame title="Activity Logs"><Table cols={['Action','Details','User','Time']} rows={items.map(x=>[<Badge t={x.action}/>,x.details,x.user,new Date(x.createdAt).toLocaleString()])}/></Frame>; }

function Profile({user,setError}) {
  const [name,setName]=useState(user?.name||user?.Name||'');
  const [password,setPassword]=useState({currentPassword:'',newPassword:'',confirmPassword:''});
  const [showCurrent,setShowCurrent]=useState(false);
  const [showNew,setShowNew]=useState(false);
  const [showConfirm,setShowConfirm]=useState(false);

  const save=async()=>{
    try{
      const u=await api('/me',{method:'PUT',body:JSON.stringify({name})});
      localStorage.setItem('ap_user',JSON.stringify(u));
      alert('Profile updated.');
    }catch(e){setError(e.message);}
  };

  const change=async()=>{
    if(password.newPassword !== password.confirmPassword){
      setError('New password and confirmation do not match.');
      return;
    }
    try{
      await api('/me/password',{method:'PUT',body:JSON.stringify({currentPassword:password.currentPassword,newPassword:password.newPassword})});
      setPassword({currentPassword:'',newPassword:'',confirmPassword:''});
      alert('Password changed.');
    }catch(e){setError(e.message);}
  };

  return <>
    <section className="profile-head">
      <div className="profile-head-left">
        <div className="eyebrow">ACCOUNT</div>
        <h2>My Profile</h2>
        <p>Manage your account information and security settings.</p>
      </div>
      <button className="refresh" onClick={()=>window.location.reload()}>↻ Refresh</button>
    </section>

    <div className="profile-grid">
      <section className="profile-card">
        <div className="profile-card-head">
          <div className="profile-avatar">A</div>
          <div>
            <h3>Profile</h3>
            <p>Update your personal information.</p>
          </div>
        </div>
        <div className="profile-divider" />

        <div className="profile-field">
          <label>Name</label>
          <div className="profile-input-wrap">
            <span className="profile-icon">♙</span>
            <input value={name} onChange={e=>setName(e.target.value)} />
          </div>
        </div>

        <div className="profile-field">
          <label>Email</label>
          <div className="profile-input-wrap">
            <span className="profile-icon">✉</span>
            <input disabled value={user?.email||user?.Email||''}/>
          </div>
        </div>

        <div className="profile-field">
          <label>Role</label>
          <div className="profile-input-wrap disabled-wrap">
            <span className="profile-icon">◇</span>
            <input disabled value={(user?.role||user?.Role||'').toLowerCase()}/>
            <span className="profile-chevron">⌄</span>
          </div>
        </div>

        <button className="primary profile-action" onClick={save}>▣ &nbsp; Save Profile</button>
      </section>

      <section className="profile-card">
        <div className="profile-card-head">
          <div className="profile-avatar lock-avatar">▣</div>
          <div>
            <h3>Change Password</h3>
            <p>Update your password to keep your account secure.</p>
          </div>
        </div>
        <div className="profile-divider" />

        <div className="profile-field">
          <label>Current Password</label>
          <div className="profile-input-wrap">
            <span className="profile-icon">▣</span>
            <input type={showCurrent?'text':'password'} placeholder="Enter your current password" value={password.currentPassword} onChange={e=>setPassword({...password,currentPassword:e.target.value})}/>
            <button className="eye-btn" type="button" onClick={()=>setShowCurrent(v=>!v)}>◉</button>
          </div>
        </div>

        <div className="profile-field">
          <label>New Password</label>
          <div className="profile-input-wrap">
            <span className="profile-icon">▣</span>
            <input type={showNew?'text':'password'} placeholder="Enter your new password" value={password.newPassword} onChange={e=>setPassword({...password,newPassword:e.target.value})}/>
            <button className="eye-btn" type="button" onClick={()=>setShowNew(v=>!v)}>◉</button>
          </div>
          <small className="password-help">Password must be at least 6 characters.</small>
        </div>

        <div className="profile-field">
          <label>Confirm New Password</label>
          <div className="profile-input-wrap">
            <span className="profile-icon">▣</span>
            <input type={showConfirm?'text':'password'} placeholder="Confirm your new password" value={password.confirmPassword} onChange={e=>setPassword({...password,confirmPassword:e.target.value})}/>
            <button className="eye-btn" type="button" onClick={()=>setShowConfirm(v=>!v)}>◉</button>
          </div>
        </div>

        <button className="primary profile-action" onClick={change}>▣ &nbsp; Change Password</button>
      </section>
    </div>
  </>;
}

function Modal({title,form,setForm,fields,extra,save,close}) {
  return <div className="overlay"><div className="modal"><div className="modal-head"><h3>{title}</h3><button onClick={close}>×</button></div>{fields.map(field=><div className="field" key={field}><label>{field.replace(/([A-Z])/g,' $1')}</label>{field==='description'?<textarea value={form[field]||''} onChange={e=>setForm({...form,[field]:e.target.value})}/>:<input type={field==='password'?'password':'text'} value={form[field]??''} onChange={e=>setForm({...form,[field]:e.target.value})}/>}</div>)}{extra}<div className="modal-actions"><button className="secondary" onClick={close}>Cancel</button><button className="primary" onClick={save}>Save</button></div></div></div>;
}

function Actions({edit,del}) { return <div className="actions">{edit && <button onClick={edit}>Edit</button>}{del && <button className="danger" onClick={()=>{if(window.confirm('Delete this record?')) del();}}>Delete</button>}</div>; }
function Badge({t}) { return <span className={`badge ${String(t).toLowerCase().replaceAll(' ','-')}`}>{t}</span>; }
function Table({cols,rows}) { return rows.length ? <div className="table-wrap"><table><thead><tr>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table></div> : <div className="empty">No records found.</div>; }

createRoot(document.getElementById('root')).render(<App />);
