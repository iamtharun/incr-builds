const fs = require('fs');

const angularJsonAsString = fs.readFileSync('angular.json', { encoding: 'utf-8' });

const angularJson = JSON.parse(angularJsonAsString);

for (const p in angularJson.projects) {

    if (angularJson.projects[p].projectType === 'library') {
        console.log(`nx g @trellisorg/make-buildable:migrate --projectName ${p} --libType angular --configs production`);
    }

}