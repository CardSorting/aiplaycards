import 'dotenv/config';
import { db } from '../src/db';

async function main() {
  await db.execute('DELETE FROM booster_drops');
  console.log('Deleted all rows from booster_drops');
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
