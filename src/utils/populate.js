import db from '../models'
import createBasis from './createBasicDBLayout'

const populate = async (force = true) => {
  console.log('trying populate')
  if (force) {
    await db.sync({force: true})

    console.log(`Force sync!`)
    try {
      await createBasis(db.models)
    }
    catch (err) {
      console.log(err);
    }
  }
  else {
    await db.sync()
    
    await createBasis(db.models)
  }
}

export default populate