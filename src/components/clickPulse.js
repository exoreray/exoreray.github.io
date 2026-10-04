export const PULSE_DURATION = .92;
const SVG_NS='http://www.w3.org/2000/svg';
const node=(tag,attributes={})=>{
  const element=document.createElementNS(SVG_NS,tag);
  for(const [name,value] of Object.entries(attributes))element.setAttribute(name,String(value));
  return element;
};

export function createClickPalette(svg,id,dark) {
  const defs=node('defs');
  const edge=node('linearGradient',{id:`${id}-edge`,x1:'0%',y1:'0%',x2:'100%',y2:'100%'});
  const glow=node('radialGradient',{id:`${id}-glow`});
  const edgeStops=[0,.23,.48,.7,1].map(offset=>node('stop',{offset}));
  const glowStops=[0,.23,1].map(offset=>node('stop',{offset}));
  edge.append(...edgeStops);glow.append(...glowStops);defs.append(edge,glow);svg.append(defs);
  const update=darkMode=>{
    const colors=darkMode?['#ae8a4d','#fff4d6','#d1b879','#f2dfb6','#a1834b']:['#9a7634','#8b682d','#bb9b5c','#89672e','#ae8b48'];
    const alphas=darkMode?[.2,1,.4,.8,.067]:[.267,1,.4,.667,.067];
    edgeStops.forEach((stop,i)=>{stop.setAttribute('stop-color',colors[i]);stop.setAttribute('stop-opacity',alphas[i]);});
    const glowColors=darkMode?['#fff7de','#e8d5a6','#d9bd80']:['#9d753d','#b58e4d','#d9bd80'];
    const glowAlphas=darkMode?[.502,.169,0]:[.282,.125,0];
    glowStops.forEach((stop,i)=>{stop.setAttribute('stop-color',glowColors[i]);stop.setAttribute('stop-opacity',glowAlphas[i]);});
    svg.style.setProperty('--click-pearl',darkMode?'#fffae9':'#73562a');
  };
  update(dark);
  return {edge:`url(#${id}-edge)`,glow:`url(#${id}-glow)`,update};
}

export function createClickPulse(svg,palette,x,y,reach) {
  const group=node('g',{'data-click-pulse':'',transform:`translate(${x} ${y})`,opacity:0});
  const glow=node('circle',{r:15,fill:palette.glow,opacity:0});
  const rings=node('g',{fill:'none',opacity:0});
  const halo=node('circle',{r:6,stroke:palette.edge,'stroke-width':8,opacity:.065});
  const edge=node('circle',{r:6,stroke:palette.edge,'stroke-width':1.05,opacity:.78});
  const inner=node('circle',{r:4.3,stroke:'var(--click-pearl)','stroke-width':.55,opacity:.16});
  const glint=node('path',{stroke:'var(--click-pearl)','stroke-width':1.25,'stroke-linecap':'round',opacity:.52});
  rings.append(halo,edge,inner,glint);group.append(glow,rings);svg.append(group);
  return {group,glow,rings,halo,edge,inner,glint,age:0,reach};
}

export function updateClickPulse(pulse,delta) {
  pulse.age+=Math.max(0,delta);
  if(pulse.age>=PULSE_DURATION){removeClickPulse(pulse);return false;}
  const progress=pulse.age/PULSE_DURATION;
  const radius=6+pulse.reach*(1-Math.pow(1-progress,3));
  const fade=Math.pow(1-progress,2)*Math.min(1,pulse.age/.035);
  pulse.glow.setAttribute('r',15+progress*22);
  pulse.glow.setAttribute('opacity',Math.exp(-pulse.age/.085)*.7);
  pulse.halo.setAttribute('r',radius);pulse.edge.setAttribute('r',radius);
  pulse.inner.setAttribute('r',Math.max(1,radius-1.7));
  const angle=-2.35+progress*.16,end=angle+.22;
  pulse.glint.setAttribute('d',`M ${Math.cos(angle)*radius} ${Math.sin(angle)*radius} A ${radius} ${radius} 0 0 1 ${Math.cos(end)*radius} ${Math.sin(end)*radius}`);
  pulse.rings.setAttribute('opacity',fade);
  pulse.group.setAttribute('opacity',1);
  return true;
}

export function removeClickPulse(pulse) {
  // Explicitly hide before detaching: no final canvas clear or retained paint state.
  pulse.group.setAttribute('opacity',0);
  pulse.group.setAttribute('visibility','hidden');
  pulse.group.remove();
}
