import { Component, lazy, Suspense, useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { loadWithRetry, recoveryUrl } from './startupRecovery';
const OriginalApp = lazy(() => loadWithRetry(()=>import('./App')));
const RainStudy = lazy(() => loadWithRetry(()=>import('./components/rain-study/RainStudy')));

export function StartupScreen({failed=false}) {
  const [slow,setSlow]=useState(false);
  useEffect(()=>{const timer=setTimeout(()=>setSlow(true),6000);return()=>clearTimeout(timer);},[]);
  return <div style={{position:'fixed',inset:0,background:'#1a1410',color:'#dcc69a',display:'grid',placeItems:'center',padding:32,textAlign:'center',cursor:'auto'}}>
    <div><p style={{fontFamily:'Georgia,serif',fontSize:30,margin:'0 0 18px'}}>Ray Xi</p>
      <p role={failed?'alert':'status'} style={{fontSize:13,lineHeight:1.8,opacity:.8}}>{failed?'The page couldn’t finish loading.':'Loading…'}</p>
      {(failed || slow) && <button type="button" onClick={()=>window.location.replace(recoveryUrl(window.location.href))} style={{marginTop:18,minHeight:44,padding:'0 20px',border:'1px solid #dcc69a66',borderRadius:24,background:'transparent',color:'inherit',font:'inherit',fontSize:13,cursor:'pointer'}}>Reload page</button>}
    </div>
  </div>;
}

export class StartupBoundary extends Component {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<StartupScreen failed/>:this.props.children;}
}

export default function PreviewApp() {
  const study = new URLSearchParams(window.location.search).get('view') !== 'original';
  return <StartupBoundary><Suspense fallback={<StartupScreen/>}>{study?<ThemeProvider><RainStudy/></ThemeProvider>:<OriginalApp/>}</Suspense></StartupBoundary>;
}
