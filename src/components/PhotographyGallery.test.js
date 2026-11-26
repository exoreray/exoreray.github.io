import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import PhotographyGallery from './PhotographyGallery';

const photos = [
  { id:'first', src:'/test-only-one.jpg', full:'/test-only-one-full.jpg', alt:'First test photograph', title:'First', category:'Places', width:1200, height:800 },
  { id:'second', src:'/test-only-two.jpg', alt:'Second test photograph', title:'Second', category:'Light', width:800, height:1200 },
  { id:'third', src:'/test-only-three.jpg', alt:'Third test photograph', title:'Third', category:'Places', width:1200, height:800 },
];

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});

test('a missing collection does not invent images or show empty filters', () => {
  render(<PhotographyGallery photos={[]} />);
  expect(screen.getByText('The collection is being prepared.')).toBeVisible();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.queryByRole('navigation', {name:'Photography categories'})).not.toBeInTheDocument();
});

test('category filtering updates both the featured image and the photograph count', () => {
  render(<PhotographyGallery photos={photos} />);
  fireEvent.click(screen.getByRole('button', {name:'Places', exact:true}));
  expect(screen.getByText('2 photographs')).toBeVisible();
  expect(screen.getByRole('button', {name:'Open First'})).toBeVisible();
  expect(screen.getByRole('button', {name:'Open Third'})).toBeVisible();
  expect(screen.queryByRole('button', {name:'Open Second'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name:'Light', exact:true}));
  expect(screen.getByText('1 photograph')).toBeVisible();
  expect(screen.getByRole('button', {name:'Open Second'})).toBeVisible();
});

test('the modal uses full resolution, wraps keyboard navigation, and returns focus on escape', () => {
  render(<PhotographyGallery photos={photos} />);
  const trigger = screen.getByRole('button', {name:'Open First'});
  trigger.focus();
  fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', {name:'Media viewer'});
  expect(within(dialog).getByRole('img')).toHaveAttribute('src','/test-only-one-full.jpg');
  fireEvent.keyDown(dialog, {key:'ArrowLeft'});
  expect(within(dialog).getByRole('img')).toHaveAttribute('alt','Third test photograph');
  fireEvent.keyDown(dialog, {key:'ArrowRight'});
  expect(within(dialog).getByRole('img')).toHaveAttribute('alt','First test photograph');
  fireEvent(dialog, new Event('cancel', {bubbles:false,cancelable:true}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

const clip = { id:'clip', type:'video', src:'/test-only-cover.jpg', full:'/test-only-cover.jpg', videoSrc:'/test-only-clip.mp4', title:'Moving light', alt:'Moving light', category:'Light', width:720, height:1280 };

test('photos and videos can be filtered independently without disguising clips as photographs', () => {
  render(<PhotographyGallery photos={[...photos, clip]} />);
  expect(screen.getByText('4 works')).toBeVisible();
  fireEvent.click(screen.getByRole('button', {name:'Videos', exact:true}));
  expect(screen.getByText('1 video')).toBeVisible();
  expect(screen.getByRole('button', {name:'Open video Moving light', exact:true})).toBeVisible();
  expect(screen.queryByRole('button', {name:'Open First'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name:'Places', exact:true}));
  expect(screen.getByText('0 videos')).toBeVisible();
  fireEvent.click(screen.getByRole('button', {name:'All', exact:true}));
  fireEvent.click(screen.getByRole('button', {name:'Photographs', exact:true}));
  expect(screen.getByText('3 photographs')).toBeVisible();
  expect(screen.queryByRole('button', {name:'Open video Moving light'})).not.toBeInTheDocument();
});

test('the video viewer preserves native controls and stops playback when it closes', () => {
  const pause = jest.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(() => {});
  const load = jest.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(() => {});
  render(<PhotographyGallery photos={[clip, ...photos]} />);
  fireEvent.click(screen.getByRole('button', {name:'Open video Moving light', exact:true}));
  const dialog = screen.getByRole('dialog', {name:'Media viewer'});
  const player = within(dialog).getByLabelText('Moving light');
  expect(player.tagName).toBe('VIDEO');
  expect(player).toHaveAttribute('src','/test-only-clip.mp4');
  expect(player).toHaveAttribute('controls');
  expect(player).toHaveAttribute('playsinline');
  expect(player).not.toHaveAttribute('autoplay');
  fireEvent.keyDown(player, {key:'ArrowRight'});
  expect(within(dialog).getByLabelText('Moving light')).toBe(player);
  fireEvent.click(within(dialog).getByRole('button',{name:'Close',exact:true}));
  expect(pause).toHaveBeenCalled();
  expect(load).toHaveBeenCalled();
  expect(player).not.toHaveAttribute('src');
  pause.mockRestore();load.mockRestore();
});
