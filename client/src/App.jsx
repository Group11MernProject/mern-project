import { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { api, getStoredSession, saveSession } from './api.js';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const FILTERS = ['All', 'Chicken', 'Vegetarian', 'Seafood', 'Beef', 'Side'];

function Icon({ name, size = 20 }) {
  const paths = {
    compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/></>,
    calendar: <><path d="M6 3v3m12-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"/><path d="M8 13h2m4 0h2m-8 4h2m4 0h2"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    arrow: <path d="m9 18 6-6-6-6"/>,
    logout: <><path d="M10 5H5v14h5m4-4 4-3-4-3m4 3H9"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    close: <path d="M6 6l12 12M18 6 6 18"/>,
    trash: <><path d="M5 7h14M9 7V4h6v3m2 0-1 13H8L7 7m3 4v5m4-5v5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    spark: <path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z"/>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c.7-5 3.3-7 8-7s7.3 2 8 7"/></>,
    leaf: <><path d="M19 4C11 4 5 7 5 13c0 3 2 5 5 5 6 0 9-6 9-14Z"/><path d="M5 20c2-6 6-9 11-12"/></>
  };
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Logo({ compact = false }) {
  return <div className={`logo ${compact ? 'compact' : ''}`}><span className="logo-mark"><Icon name="leaf" size={21} /></span>{!compact && <span>Plate<span>Pilot</span></span>}</div>;
}

function AuthScreen({ onAuthenticated, googleEnabled, notice }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const data = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) });
      onAuthenticated(data);
    } catch (caught) { setError(caught.message); }
    finally { setBusy(false); }
  }

  async function demoLogin() {
    setBusy(true); setError('');
    try { onAuthenticated(await api('/auth/demo', { method: 'POST' })); }
    catch (caught) { setError(caught.message); }
    finally { setBusy(false); }
  }

  async function googleLogin(response) {
    setBusy(true); setError('');
    try { onAuthenticated(await api('/auth/google', { method: 'POST', body: JSON.stringify({ credential: response.credential }) })); }
    catch (caught) { setError(caught.message); }
    finally { setBusy(false); }
  }

  return <main className="auth-page">
    <section className="auth-story">
      <div className="story-glow story-glow-one" />
      <div className="story-glow story-glow-two" />
      <Logo />
      <div className="story-copy">
        <span className="eyebrow light"><Icon name="spark" size={15}/> Plan less. Savor more.</span>
        <h1>Your whole week,<br/><em>beautifully fed.</em></h1>
        <p>Discover recipes you’ll actually want to make and shape them into a plan that fits your life.</p>
      </div>
      <div className="week-preview" aria-hidden="true">
        <div className="preview-head"><span>This week</span><span>3 meals planned</span></div>
        {[
          ['MON', 'Teriyaki chicken', 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg'],
          ['WED', 'Baked salmon', 'https://www.themealdb.com/images/media/meals/1548772327.jpg'],
          ['FRI', 'Arrabbiata penne', 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg']
        ].map(([day, meal, image]) => <div className="preview-meal" key={day}><span>{day}</span><img src={image} alt=""/><strong>{meal}</strong><Icon name="check" size={16}/></div>)}
      </div>
      <p className="story-foot">Recipes powered by TheMealDB</p>
    </section>
    <section className="auth-panel">
      <div className="mobile-logo"><Logo /></div>
      <div className="auth-card">
        <span className="eyebrow">Welcome to PlatePilot</span>
        <h2>{mode === 'login' ? 'Good to see you again.' : 'Let’s make dinner easier.'}</h2>
        <p className="auth-subtitle">{mode === 'login' ? 'Sign in to pick up where you left off.' : 'Create your free account in under a minute.'}</p>
        {notice && <div className="notice success"><Icon name="check" size={18}/>{notice}</div>}
        {error && <div className="notice error" role="alert">{error}</div>}
        {googleEnabled ? <div className="google-wrap"><GoogleLogin onSuccess={googleLogin} onError={() => setError('Google sign-in was cancelled.')} width="360" shape="pill" text={mode === 'login' ? 'signin_with' : 'signup_with'} /></div> : <button className="google-placeholder" type="button" disabled title="Add VITE_GOOGLE_CLIENT_ID to enable Google OAuth"><span className="google-g">G</span> Continue with Google</button>}
        <div className="divider"><span>or continue with email</span></div>
        <form onSubmit={submit}>
          {mode === 'register' && <label>Full name<input autoComplete="name" required minLength="2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" /></label>}
          <label>Email address<input type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="alex@example.com" /></label>
          <label>Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" /></label>
          <button className="button primary wide" disabled={busy}>{busy ? 'One moment…' : mode === 'login' ? 'Sign in' : 'Create my account'}<Icon name="arrow" size={18}/></button>
        </form>
        <p className="auth-switch">{mode === 'login' ? 'New to PlatePilot?' : 'Already have an account?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
        <button className="demo-link" type="button" onClick={demoLogin} disabled={busy}><Icon name="spark" size={16}/> Explore the presentation demo</button>
      </div>
    </section>
  </main>;
}

function Sidebar({ view, setView, user, logout, mobileOpen, closeMobile }) {
  return <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
    <div className="side-head"><Logo /><button className="icon-button mobile-close" onClick={closeMobile} aria-label="Close menu"><Icon name="close"/></button></div>
    <nav aria-label="Main navigation">
      <button className={view === 'discover' ? 'active' : ''} onClick={() => { setView('discover'); closeMobile(); }}><Icon name="compass"/>Discover</button>
      <button className={view === 'plan' ? 'active' : ''} onClick={() => { setView('plan'); closeMobile(); }}><Icon name="calendar"/>My week</button>
    </nav>
    <div className="side-tip"><span><Icon name="spark" size={15}/></span><strong>Planning tip</strong><p>Start with your busiest night, then build around it.</p></div>
    <div className="profile-row">
      {user.avatar ? <img src={user.avatar} alt="" referrerPolicy="no-referrer"/> : <span className="avatar">{user.name?.[0]}</span>}
      <span><strong>{user.name}</strong><small>{user.email}</small></span>
      <button onClick={logout} aria-label="Sign out" title="Sign out"><Icon name="logout" size={19}/></button>
    </div>
  </aside>;
}

function RecipeCard({ recipe, onPlan, onDetail, plannedDay }) {
  return <article className="recipe-card">
    <button className="recipe-image" onClick={() => onDetail(recipe)} aria-label={`View ${recipe.title}`}>
      <img src={recipe.image} alt="" loading="lazy" />
      <span className="time"><Icon name="clock" size={14}/> 30 min</span>
      {plannedDay && <span className="planned"><Icon name="check" size={14}/>{plannedDay}</span>}
    </button>
    <div className="recipe-body">
      <div className="recipe-meta"><span>{recipe.category}</span><i/> <span>{recipe.area}</span></div>
      <h3><button onClick={() => onDetail(recipe)}>{recipe.title}</button></h3>
      <div className="recipe-actions"><span className="match"><Icon name="spark" size={15}/>Great match</span><button className="add-button" onClick={() => onPlan(recipe)} aria-label={`Add ${recipe.title} to meal plan`}><Icon name="plus" size={19}/></button></div>
    </div>
  </article>;
}

function MiniPlan({ meals, onViewPlan }) {
  return <aside className="mini-plan">
    <div className="mini-head"><span><small>YOUR PLAN</small><strong>This week</strong></span><button onClick={onViewPlan}>View all</button></div>
    <div className="mini-days">
      {DAYS.slice(0, 5).map((day) => {
        const meal = meals.find((item) => item.day === day);
        return <div className={`mini-day ${meal ? 'has-meal' : ''}`} key={day}><span>{day.slice(0, 3)}</span>{meal ? <><img src={meal.image} alt=""/><div><strong>{meal.title}</strong><small>{meal.category || meal.area}</small></div><Icon name="check" size={16}/></> : <p>Open night</p>}</div>;
      })}
    </div>
    <div className="plan-progress"><div><span>{meals.length} of 7 nights</span><span>{Math.round(meals.length / 7 * 100)}%</span></div><i><b style={{ width: `${meals.length / 7 * 100}%` }}/></i></div>
  </aside>;
}

function DayPicker({ recipe, meals, onClose, onChoose }) {
  if (!recipe) return null;
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className="modal day-modal" role="dialog" aria-modal="true" aria-labelledby="day-title">
      <div className="modal-top"><span className="eyebrow">Add to your week</span><button className="icon-button" onClick={onClose} aria-label="Close"><Icon name="close"/></button></div>
      <div className="selected-recipe"><img src={recipe.image} alt=""/><span><small>{recipe.category} · {recipe.area}</small><h2 id="day-title">{recipe.title}</h2></span></div>
      <p>Which night works best?</p>
      <div className="day-options">{DAYS.map((day) => { const current = meals.find((meal) => meal.day === day); return <button key={day} onClick={() => onChoose(day)}><span><strong>{day}</strong><small>{current ? `Replace ${current.title}` : 'Open night'}</small></span><Icon name="arrow" size={18}/></button>; })}</div>
    </section>
  </div>;
}

function RecipeDetail({ recipe, detail, onClose, onPlan }) {
  if (!recipe) return null;
  const shown = detail || recipe;
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className="modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-title">
      <button className="icon-button detail-close" onClick={onClose} aria-label="Close"><Icon name="close"/></button>
      <div className="detail-hero"><img src={shown.image} alt=""/><span>{shown.category} · {shown.area}</span></div>
      <div className="detail-copy"><span className="eyebrow">Recipe details</span><h2 id="recipe-title">{shown.title}</h2><div className="detail-badges"><span><Icon name="clock" size={16}/> 30 minutes</span><span><Icon name="user" size={16}/> 4 servings</span></div>
        {shown.ingredients?.length > 0 && <><h3>What you’ll need</h3><div className="ingredients">{shown.ingredients.slice(0, 10).map((item) => <span key={`${item.ingredient}-${item.measure}`}><Icon name="check" size={14}/>{item.measure} {item.ingredient}</span>)}</div></>}
        <h3>How to make it</h3><p className="instructions">{shown.instructions || 'Full cooking directions are loading from our recipe partner.'}</p>
        <button className="button primary" onClick={() => onPlan(shown)}><Icon name="plus" size={18}/> Add to my week</button>
      </div>
    </section>
  </div>;
}

function WeekPlan({ meals, onRemove, onDiscover, onDetail }) {
  return (
    <section className="plan-page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Your weekly rhythm</span>
          <h1>Seven days, one simple plan.</h1>
          <p>
            {meals.length
              ? `${meals.length} meals planned. Your future self says thank you.`
              : 'Your week is wide open. Let’s add something delicious.'}
          </p>
        </div>

        <button className="button secondary" onClick={onDiscover}>
          <Icon name="plus" size={18} /> Find recipes
        </button>
      </div>

      <div className="week-stats">
        <div>
          <strong>{meals.length}</strong>
          <span>meals planned</span>
        </div>
        <div>
          <strong>{7 - meals.length}</strong>
          <span>open nights</span>
        </div>
        <div>
          <strong>{meals.length * 30}</strong>
          <span>minutes saved</span>
        </div>
      </div>

      <div className="week-grid">
        {DAYS.map((day, index) => {
          const meal = meals.find((item) => item.day === day);

          return (
            <article className={`day-card ${meal ? 'filled' : ''}`} key={day}>
              <div className="day-head">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{day}</strong>

                {meal && (
                  <button
                    type="button"
                    onClick={() => onRemove(day)}
                    aria-label={`Remove ${day}'s meal`}
                  >
                    <Icon name="trash" size={17} />
                  </button>
                )}
              </div>

              {meal ? (
                <button
                  type="button"
                  className="day-meal-button"
                  onClick={() => onDetail(meal)}
                  aria-label={`View recipe for ${meal.title}`}
                >
                  <img src={meal.image} alt="" />

                  <div className="day-meal">
                    <small>
                      {meal.category} · {meal.area}
                    </small>
                    <h2>{meal.title}</h2>
                    <span>
                      <Icon name="check" size={14} />
                      Ready to cook
                    </span>
                  </div>
                </button>
              ) : (
                <button className="empty-night" onClick={onDiscover}>
                  <span>
                    <Icon name="plus" />
                  </span>
                  <strong>Add a meal</strong>
                  <small>Keep the night flexible</small>
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function App({ googleEnabled }) {
  const initialSession = getStoredSession();
  const [session, setSession] = useState(initialSession);
  const [view, setView] = useState('discover');
  const [recipes, setRecipes] = useState([]);
  const [meals, setMeals] = useState([]);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [pickerRecipe, setPickerRecipe] = useState(null);
  const [detailRecipe, setDetailRecipe] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [toast, setToast] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const searchRef = useRef(null);

  function authenticate(data) { const next = { token: data.token, user: data.user }; saveSession(next); setSession(next); if (data.message) setToast(data.message); }
  function logout() { saveSession(null); setSession(null); setMeals([]); setView('discover'); }

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) return;
    api('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) })
      .then((data) => { setAuthNotice(data.message); if (session) { const next = { ...session, user: data.user }; saveSession(next); setSession(next); } })
      .catch((error) => setAuthNotice(error.message));
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  useEffect(() => {
    if (!session) return;
    Promise.all([api('/auth/me'), api('/meal-plans')])
      .then(([identity, plan]) => { const next = { ...session, user: identity.user }; saveSession(next); setSession(next); setMeals(plan.meals); })
      .catch(() => logout());
  }, [session?.token]);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    const timer = setTimeout(() => {
      api(`/recipes?search=${encodeURIComponent(activeSearch)}`)
        .then((data) => setRecipes(data.recipes))
        .catch((error) => setToast(error.message))
        .finally(() => setLoading(false));
    }, activeSearch ? 250 : 0);
    return () => clearTimeout(timer);
  }, [session?.token, activeSearch]);

  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3500); return () => clearTimeout(timer); }, [toast]);

  const visibleRecipes = useMemo(() => filter === 'All' ? recipes : recipes.filter((recipe) => recipe.category === filter), [recipes, filter]);

  function runSearch(event) { event?.preventDefault(); setActiveSearch(search.trim()); setFilter('All'); }
  async function chooseDay(day) {
    try {
      // Recipe cards use `id`, while the meal-plan API intentionally stores it as
      // `recipeId`. Send the API contract explicitly rather than relying on the
      // display-model property name.
      const { id, title, image, category = '', area = '' } = pickerRecipe || {};
      const data = await api(`/meal-plans/${day}`, {
        method: 'PUT',
        body: JSON.stringify({ recipeId: id, title, image, category, area })
      });
      setMeals(data.meals); setToast(data.message); setPickerRecipe(null); setDetailRecipe(null);
    } catch (error) { setToast(error.message); }
  }
  async function removeMeal(day) {
    try { const data = await api(`/meal-plans/${day}`, { method: 'DELETE' }); setMeals(data.meals); setToast(data.message); }
    catch (error) { setToast(error.message); }
  }
  async function showDetail(recipe) {
    setDetailRecipe(recipe); setDetailData(null);
    try { const data = await api(`/recipes/${recipe.id}`); setDetailData(data.recipe); } catch { setDetailData(recipe); }
  }
  async function resend() { try { const data = await api('/auth/resend-verification', { method: 'POST' }); setToast(data.message); } catch (error) { setToast(error.message); } }

  if (!session) return <AuthScreen onAuthenticated={authenticate} googleEnabled={googleEnabled} notice={authNotice} />;

  return <div className="app-shell">
    <Sidebar view={view} setView={setView} user={session.user} logout={logout} mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} />
    <main className="app-main">
      <header className="topbar"><button className="icon-button menu-button" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Icon name="menu"/></button><div className="mobile-brand"><Logo /></div><form className="search" onSubmit={runSearch}><Icon name="search"/><input ref={searchRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search recipes, ingredients, cuisines…" aria-label="Search recipes"/><kbd>↵</kbd></form><button className="top-plan" onClick={() => setView('plan')}><Icon name="calendar"/><span>{meals.length}/7</span></button></header>
      {!session.user.isEmailVerified && <div className="verify-banner"><span><Icon name="spark" size={17}/>Verify your email to keep your meal plans secure.</span><button onClick={resend}>Resend email</button></div>}
      {view === 'discover' ? <div className="discover-layout">
        <section className="discover-main">
          <div className="hero"><div className="hero-copy"><span className="eyebrow light"><Icon name="spark" size={15}/> Your week, simplified</span><h1>Good food starts<br/>with a <em>good plan.</em></h1><p>Fresh inspiration, organized around the way you actually live.</p><button className="button cream" onClick={() => searchRef.current?.focus()}>Find tonight’s dinner <Icon name="arrow" size={18}/></button></div><div className="hero-art" aria-hidden="true"><div className="plate plate-one"><img src="https://www.themealdb.com/images/media/meals/qptpvt1487339892.jpg" alt=""/></div><div className="plate plate-two"><img src="https://www.themealdb.com/images/media/meals/1548772327.jpg" alt=""/></div><span className="herb herb-one">✦</span><span className="herb herb-two">❧</span><div className="hero-note"><Icon name="check" size={16}/><span><strong>3 meals planned</strong><small>You’re ahead of the week</small></span></div></div></div>
          <div className="section-heading"><div><span className="eyebrow">Curated for real life</span><h2>{activeSearch ? `Results for “${activeSearch}”` : 'What sounds good?'}</h2></div>{activeSearch && <button className="text-button" onClick={() => { setActiveSearch(''); setSearch(''); }}>Clear search</button>}</div>
          <div className="filters" role="group" aria-label="Filter recipes">{FILTERS.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item === 'All' && <Icon name="spark" size={14}/>} {item}</button>)}</div>
          {loading ? <div className="recipe-grid">{Array.from({ length: 6 }, (_, index) => <div className="recipe-card skeleton" key={index}><i/><span/><b/></div>)}</div> : visibleRecipes.length ? <div className="recipe-grid">{visibleRecipes.slice(0, 12).map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} onPlan={setPickerRecipe} onDetail={showDetail} plannedDay={meals.find((meal) => meal.recipeId === recipe.id)?.day}/>)}</div> : <div className="empty-results"><span><Icon name="search" size={28}/></span><h3>No recipes found</h3><p>Try a broader search like “chicken,” “pasta,” or “curry.”</p></div>}
        </section>
        <MiniPlan meals={meals} onViewPlan={() => setView('plan')} />
      </div> : <WeekPlan meals={meals} onRemove={removeMeal} onDiscover={() => setView('discover')} />}
    </main>
    {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
    <DayPicker recipe={pickerRecipe} meals={meals} onClose={() => setPickerRecipe(null)} onChoose={chooseDay}/>
    <RecipeDetail recipe={detailRecipe} detail={detailData} onClose={() => setDetailRecipe(null)} onPlan={(recipe) => { setPickerRecipe(recipe); setDetailRecipe(null); }}/>
    {toast && <div className="toast" role="status"><span><Icon name="check" size={16}/></span>{toast}</div>}
  </div>;
}

export default App;
