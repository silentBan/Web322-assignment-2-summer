import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let items = [];
let categories = [];

export const initialize = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
      if (err) {
        reject('Unable to read items file');
      } else {
        items = JSON.parse(data);
        fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
          if (err) {
            reject('Unable to read categories file');
          } else {
            categories = JSON.parse(data);
            resolve();
          }
        });
      }
    });
  });
};

export const getAllItems = () => {
  return new Promise((resolve, reject) => {
    if (items.length === 0) {
      reject('No results returned');
    } else {
      resolve(items);
    }
  });
};

export const getPublishedItems = () => {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter(item => item.published);
    if (publishedItems.length === 0) {
      reject('No results returned');
    } else {
      resolve(publishedItems);
    }
  });
};

export const getCategories = () => {
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
      reject('No results returned');
    } else {
      resolve(categories);
    }
  });
};

export const addItem = (itemData) => {
  return new Promise((resolve, reject) => {
    itemData.published = itemData.published === undefined ? false : true;
    itemData.id = items.length + 1;

    // Add the postDate
    const now = new Date();
    itemData.postDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    items.push(itemData);
    fs.writeFile(path.join(__dirname, 'data', 'items.json'), JSON.stringify(items), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(itemData);
      }
    });
  });
};

export const getItemsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    const filteredItems = items.filter(item => item.category === category);
    if (filteredItems.length === 0) {
      reject('No results returned');
    } else {
      resolve(filteredItems);
    }
  });
};

export const getItemsByMinDate = (minDateStr) => {
  return new Promise((resolve, reject) => {
    const minDate = new Date(minDateStr);
    if (isNaN(minDate.getTime())) {
      reject('Invalid date format');
    } else {
      const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);
      if (filteredItems.length === 0) {
        reject('No results returned');
      } else {
        resolve(filteredItems);
      }
    }
  });
};

export const getItemById = (id) => {
  return new Promise((resolve, reject) => {
    const item = items.find(item => item.id === parseInt(id));
    if (!item) {
      reject('No result returned');
    } else {
      resolve(item);
    }
  });
};

// New function to get published items by category
export const getPublishedItemsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    const filteredItems = items.filter(item => item.published === true && item.category === category);
    if (filteredItems.length === 0) {
      reject('No results returned');
    } else {
      resolve(filteredItems);
    }
  });
};