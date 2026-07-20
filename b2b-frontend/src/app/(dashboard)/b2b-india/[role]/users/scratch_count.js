
import fs from 'fs';

const content = fs.readFileSync('c:/React/B2B/b2b-frontend/src/app/(dashboard)/super-admin/users/page.tsx', 'utf8');

let openBraces = 0;
let closeBraces = 0;
let openParens = 0;
let closeParens = 0;

for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') openBraces++;
    if (content[i] === '}') closeBraces++;
    if (content[i] === '(') openParens++;
    if (content[i] === ')') closeParens++;
}

console.log(`Braces: { ${openBraces}, } ${closeBraces} (Diff: ${openBraces - closeBraces})`);
console.log(`Parens: ( ${openParens}, ) ${closeParens} (Diff: ${openParens - closeParens})`);
