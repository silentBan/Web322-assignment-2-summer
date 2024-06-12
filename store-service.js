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