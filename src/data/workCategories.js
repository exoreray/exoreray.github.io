import copy from './siteCopy.json';
import photographs from './photographs.json';

// Keep the collection out of navigation until real photographs are selected.
export const workCategories = photographs.length ? [...copy.works.categories, {
  id: 'photography', number: '05', title: 'Photography',
  description: 'Places, light, and moments worth keeping.', ctaLabel: 'VIEW',
}] : copy.works.categories;
