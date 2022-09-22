import { faker } from '@faker-js/faker';
import axios from 'axios';

async function run() {
  for (let i = 0; i < 3000; i++) {
    console.log(i);
    const a = await axios.post('http://localhost:3333/certifications', {
      name: faker.name.firstName(),
      course: faker.music.songName(),
    });
  }

  console.log('done');
}

run().catch(console.error);
