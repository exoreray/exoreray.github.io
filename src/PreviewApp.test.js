import React from 'react';
import { render, screen } from '@testing-library/react';
import PreviewApp from './PreviewApp';

jest.mock('./context/ThemeContext',()=>({ThemeProvider:({children})=>children}));
jest.mock('./App',()=>({__esModule:true,default:()=> <h1>Original site</h1>}));
jest.mock('./components/rain-study/RainStudy',()=>({__esModule:true,default:()=> <h1>Current site</h1>}));

afterEach(()=>window.history.replaceState({},'', '/'));

test.each(['/', '/#/milestones', '/?view=rain#/design'])(
  'the current site is the default at %s',async url=>{
    window.history.replaceState({},'',url);
    render(<PreviewApp/>);
    await screen.findByRole('heading',{name:'Current site'});
  }
);

test('the original site requires its explicit comparison URL',async()=>{
  window.history.replaceState({},'', '/?view=original#/');
  render(<PreviewApp/>);
  await screen.findByRole('heading',{name:'Original site'});
});
