import copy from './siteCopy.json';
import photographs from './photographs.json';

export const workCategories = copy.works.categories;
// Keep an empty photography collection out of the Art navigation.
export const artCategories = copy.art.categories.filter(category=>category.id!=='photography' || photographs.length);
