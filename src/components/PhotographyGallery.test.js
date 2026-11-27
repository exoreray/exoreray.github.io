import { act, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import PhotographyGallery from './PhotographyGallery';
const photos=[
 {id:'first',src:'/one.jpg',full:'/one-full.jpg',title:'First',alt:'First photograph',category:'Nature',subjects:['Water'],vibes:['Calm'],colors:['Blue'],date:'2024-03-24',width:1200,height:800},
 {id:'second',src:'/two.jpg',title:'Second',alt:'Second photograph',category:'Places',subjects:['Architecture'],vibes:['Urban'],colors:['Gray'],date:'2022-09-10',width:800,height:1200},
 {id:'third',src:'/three.jpg',title:'Third',alt:'Third photograph',category:'Nature',subjects:['Water'],vibes:['Calm'],colors:['Blue'],date:'2024-03-24',width:1200,height:800},
];
beforeEach(()=>{
 HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
});
test('a missing collection stays empty',()=>{render(<PhotographyGallery photos={[]}/>);expect(screen.getByText('The collection is being prepared.')).toBeVisible();expect(screen.queryByRole('img')).not.toBeInTheDocument();});
test('a word gathers a real subset and a contact sheet preserves all works',()=>{
 render(<PhotographyGallery photos={photos}/>);
 expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Words',exact:true}));
 fireEvent.click(screen.getByRole('button',{name:'Explore Water',exact:true}));
 expect(screen.getByRole('button',{name:'Open First',exact:true})).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Open Third',exact:true})).toBeInTheDocument();
 expect(screen.queryByRole('button',{name:'Open Second',exact:true})).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'All moments',exact:true}));
 fireEvent.click(screen.getByRole('button',{name:'Open contact sheet',exact:true}));
 expect(within(screen.getByRole('region',{name:'Contact sheet'})).getAllByRole('button')).toHaveLength(3);
});
test('the full-size modal wraps navigation and restores focus',()=>{
 render(<PhotographyGallery photos={photos}/>);const trigger=screen.getByRole('button',{name:'Open First',exact:true});act(()=>trigger.focus());fireEvent.click(trigger);
 const dialog=screen.getByRole('dialog',{name:'Media viewer'});expect(within(dialog).getByRole('img')).toHaveAttribute('src','/one-full.jpg');
 fireEvent.keyDown(dialog,{key:'ArrowLeft'});expect(within(dialog).getByRole('img')).toHaveAttribute('alt','Third photograph');
 fireEvent.keyDown(dialog,{key:'ArrowRight'});expect(within(dialog).getByRole('img')).toHaveAttribute('alt','First photograph');
 fireEvent(dialog,new Event('cancel',{bubbles:false,cancelable:true}));expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(trigger).toHaveFocus();
});
test('a date in the viewer opens the photographs from that day',()=>{
 render(<PhotographyGallery photos={photos}/>);fireEvent.click(screen.getByRole('button',{name:'Open First',exact:true}));
 fireEvent.click(screen.getByRole('button',{name:'Explore date Mar 24, 2024'}));
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(screen.getByRole('button',{name:'Open Third',exact:true})).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Open Second',exact:true})).not.toBeInTheDocument();
});
test('native video controls keep seeking and stop playback on close',()=>{
 const pause=jest.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{}),load=jest.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(()=>{});
 const clip={...photos[0],id:'clip',type:'video',videoSrc:'/clip.mp4'};
 render(<PhotographyGallery photos={[clip,...photos]}/>);
 fireEvent.click(screen.getByRole('button',{name:'Open video First',exact:true}));
 const dialog=screen.getByRole('dialog',{name:'Media viewer'}),player=within(dialog).getByLabelText('First');
 expect(player.tagName).toBe('VIDEO');expect(player).toHaveAttribute('controls');expect(player).toHaveAttribute('playsinline');expect(player).not.toHaveAttribute('autoplay');
 fireEvent.keyDown(player,{key:'ArrowRight'});expect(within(dialog).getByLabelText('First')).toBe(player);
 fireEvent.click(within(dialog).getByRole('button',{name:'Close',exact:true}));expect(pause).toHaveBeenCalled();expect(load).toHaveBeenCalled();expect(player).not.toHaveAttribute('src');
 pause.mockRestore();load.mockRestore();
});
