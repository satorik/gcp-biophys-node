const educationQuery = {
  timeHeaders(parent, args, { models }) {
    return models.ScheduleTime.findAll({ raw: true })
  },
  async days(parent, args, { models }) {
    const days = await models.ScheduleDay.findAll({
      raw: true,
      attributes: ['title'],
      order: [['id', 'ASC']],
    })
    return days.map(day => day.title)
  },
  async years(parent, args, { models }) {
    let years

    if (!args) {
      years = await models.ScheduleYear.findAll({ raw: true })
    } else {
      years = await models.ScheduleYear.findAll({ raw: true, where: args })
    }
    return years
  },
  async timetable(parent, args, { models }) {
    const timetable = await models.ScheduleTimetable.findAll({
      raw: true,
      where: { yearId: parent.id },
      order: [
        ['dayId', 'ASC'],
        ['isEven', 'ASC'],
        ['timeFrom', 'ASC'],
      ],
    })
    const updatedTimetable = timetable.map(item => {
      return {
        ...item,
        year: parent.title,
        startDate: item.startDate && item.startDate.toISOString(),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }
    })

    return updatedTimetable
  },
  async courses(parent, args, { models }) {
    let courses

    if (!args) {
      courses = await models.EducationCourse.findAll({ raw: true })
    } else {
      courses = await models.EducationCourse.findAll({ raw: true, where: args })
    }
    return courses
  },
  async resourses(parent, args, { models }) {
    const reses = await models.EducationResourse.findAll({
      raw: true,
      where: { educationCourseId: parent.id },
      order: [
        ['educationFormId', 'ASC'],
        ['title', 'ASC'],
      ],
    })
    return reses.sort((a, b) => {
      return a.title.localeCompare(b.title, undefined, {
        numeric: true,
        sensitivity: 'base',
      })
    })
  },
  forms(parent, { id }, { models }) {
    return models.EducationForm.findAll({
      raw: true,
      where: { educationFormId: null },
    })
  },
  admission(parent, { section }, { models }) {
    return models.TextDescription.findOne({ where: { section }, raw: true })
  },
}

const EducationResourse = {
  async form(parent, args, { models }) {
    const form = await models.EducationForm.findOne({
      raw: true,
      where: { id: parent.educationFormId },
    })
    const parentForm = await models.EducationForm.findOne({
      raw: true,
      where: { id: form.educationFormId },
    })
    const subSections = await models.EducationForm.findAll({
      raw: true,
      where: { educationFormId: form.id },
    })

    return {
      ...form,
      parentForm,
      subSections,
    }
  },
}
const EducationForm = {
  subSections(parent, args, { models }) {
    return models.EducationForm.findAll({
      raw: true,
      where: { educationFormId: parent.id },
    })
  },
}

export { educationQuery, EducationForm, EducationResourse }
