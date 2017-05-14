import fs from 'fs';
import { Map, List } from 'immutable';

export const mainConversions = ['application', 'catalog'];
export const microConversions = ['discount', 'howtojoin', 'insurance', 'whoweare'];

export let visits = Map();
export let referrers = Map();

export const clicksStream = fs.createReadStream('./hw5/data/clicks.csv');
export const searchEngineStream = fs.createReadStream('./hw5/data/search_engine_map.csv');
export const visitorsStream = fs.createReadStream('./hw5/data/visitors.csv');
export const writableStream = fs.createWriteStream('./hw5/out/out.csv');
export const writableStreamCluster = fs.createWriteStream('./hw5/out/cluster.csv');
