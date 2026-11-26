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
  const dialog = screen.getByRole('dialog', {name:'Photograph viewer'});
  expect(within(dialog).getByRole('img')).toHaveAttribute('src','/test-only-one-full.jpg');
  fireEvent.keyDown(dialog, {key:'ArrowLeft'});
  expect(within(dialog).getByRole('img')).toHaveAttribute('alt','Third test photograph');
  fireEvent.keyDown(dialog, {key:'ArrowRight'});
  expect(within(dialog).getByRole('img')).toHaveAttribute('alt','First test photograph');
  fireEvent(dialog, new Event('cancel', {bubbles:false,cancelable:true}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
