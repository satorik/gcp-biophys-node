import  Sequelize from 'sequelize'
import config from '../config/config'

console.log(config.DB_HOST, config.DB_NAME, config.DB_USER, config.DB_PASSWORD)

const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASSWORD, {
  host: config.DB_HOST,
  dialect: 'postgres',
  dialectOptions: {
    useUTC: false,
    socketPath: config.DB_HOST
  },
  schema:config.DB_SCHEMA,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
  //console.log,

})

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  })

  const models = {
    NavigationLink: sequelize.import('./shared/navigationLink'),
    TextDescription: sequelize.import('./shared/textDescription'),
    DepartmentStaff: sequelize.import('./department/departmentStaff'),
    DepartmentPartnership: sequelize.import('./department/departmentPartnership'),
    DepartmentPrint: sequelize.import('./department/departmentPrint'),
    ScheduleDay: sequelize.import('./education/schedule/scheduleDay'),
    ScheduleTime: sequelize.import('./education/schedule/scheduleTime'),
    ScheduleYear: sequelize.import('./education/schedule/scheduleYear'),
    ScheduleTimetable: sequelize.import('./education/schedule/scheduleTimetable'),
    ScienceRoute: sequelize.import('./science/scienceRoute'),
    ScienceGroup: sequelize.import('./science/scienceGroup'),
    SciencePeople: sequelize.import('./science/sciencePeople'),
    ScienceArticle: sequelize.import('./science/scienceArticle'),
    Blogpost: sequelize.import('./blog.js'),
    Conference: sequelize.import('./conference.js'),
    Seminar: sequelize.import('./seminar.js'),
    Note: sequelize.import('./note.js'),
    EducationForm: sequelize.import('./education/courses/educationForms'),
    EducationCourse: sequelize.import('./education/courses/educationCourse'),
    EducationResourse: sequelize.import('./education/courses/educationResourse'),
    User: sequelize.import('./user.js'),
    BackUp: sequelize.import('./backup.js')
  }
  
  models.EducationResourse.belongsTo(models.EducationForm)
  models.EducationCourse.hasMany(models.EducationResourse, { onDelete: 'cascade' })
  models.ScienceRoute.hasMany(models.ScienceGroup, { onDelete: 'cascade' })
  models.ScienceGroup.hasMany(models.SciencePeople, { onDelete: 'cascade' })
  models.ScienceGroup.hasMany(models.ScienceArticle, { onDelete: 'cascade' })
  models.EducationForm.hasOne(models.EducationForm)
  
  Object.keys(models).forEach(key => {
    models[key].belongsTo(models.User, { foreignKey: 'userUpdated' })
  
    if (key !== 'User') {
      models[key].belongsTo(models.User, { foreignKey: 'userCreated' })
    }
    
  })

 export { models, sequelize as default }


