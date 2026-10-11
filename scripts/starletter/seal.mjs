import {readFile, writeFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
// Password enters over stdin; the private source letter is never copied into Git.
const [sourcePath, destination] = process.argv.slice(2);
if (!sourcePath || !destination) throw new Error('Usage: node seal.mjs <private-letter.txt> <letter.enc.json> (password on stdin)');
let password = '';
for await (const chunk of process.stdin) password += chunk;
password = password.replace(/\r?\n$/, '');
if (!password) throw new Error('A password is required');
const original = await readFile(sourcePath, 'utf8');
const paragraphs = original.trim().split(/\n\s*\n/);
const divisions = [
  [0, '关于我们此刻的名字'],
  [20, '关于一个人生伙伴'],
  [25, '关于一起创造的世界'],
  [51, '关于我想寻找的你'],
  [60, '关于开始，关于时间'],
  [76, '关于我们的选择']
];
const highlights = new Set([9,13,26,29,31,32,36,46,50,52,58,67,76,78,81,82]);
const chapters = divisions.map(([start,title],i) => ({title,paragraphs:paragraphs.slice(start,divisions[i+1]?.[0]).map((paragraph,j) => ({key:highlights.has(start+j),sentences:paragraph.match(/[^。！？]+[。！？]?/gu)||[paragraph]}))}));
const recovered = chapters.flatMap(chapter => chapter.paragraphs.map(paragraph => paragraph.sentences.join(''))).join('\n\n');
if (recovered !== original.trim()) throw new Error('Text preservation check failed');
const salt = webcrypto.getRandomValues(new Uint8Array(16));
const iv = webcrypto.getRandomValues(new Uint8Array(12));
const iterations = 600000;
const material = await webcrypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
const key = await webcrypto.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt']);
password = '';
const cipher = await webcrypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify({chapters})));
const b64 = value => Buffer.from(value).toString('base64');
await writeFile(destination,JSON.stringify({version:1,algorithm:'AES-256-GCM',kdf:'PBKDF2-SHA256',iterations,salt:b64(salt),iv:b64(iv),ciphertext:b64(cipher)}));
console.log(JSON.stringify({paragraphs:paragraphs.length,sentences:chapters.flatMap(c=>c.paragraphs.flatMap(p=>p.sentences)).length,textPreserved:true}));
