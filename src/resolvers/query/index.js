import departmentQuery from './department'
import { educationQuery } from './education'
import scienceQuery from './science'
import sharedQuery from './shared'
import blogpostQuery from './blogpost'
import conferenceQuery from './conference'
import seminarQuery from './seminar'
import noteQuery from './note'
import userQuery from './user'

const Query = {
  ...departmentQuery,
  ...educationQuery,
  ...scienceQuery,
  ...sharedQuery,
  ...blogpostQuery,
  ...conferenceQuery,
  ...seminarQuery,
  ...noteQuery,
  ...userQuery
}

export default Query