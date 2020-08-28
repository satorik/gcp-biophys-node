import { ApolloError } from 'apollo-server'
import writeImage from '../../utils/readStreamIntoFile'
import clearImage, { renameFile } from '../../utils/imageFunctions'
import getUser from '../../utils/getUser'

const checkUniqueName = async (title, parentId, currentModel) => {
  const notUniqueName = await currentModel.findOne({
    where: {
      title: title,
      educationFormIdParent: parentId,
    },
  })
  if (notUniqueName) return false
  return true
}

const getEducationSubsection = async (
  subSectionId,
  subSectionText,
  educationFormId,
  models,
  filetype
) => {
  if (subSectionId || subSectionText) {
    if (subSectionId !== '') {
      const sub = await models.EducationForm.findOne({
        where: { id: subSectionId },
        raw: true,
      })
      const subParent = await models.EducationForm.findOne({
        where: { id: sub.educationFormId },
        raw: true,
      })
      return {
        subSectionId: sub.id,
        subSectionTitle: sub.title,
        parentId: subParent.id,
        parentTitle: subParent.title,
      }
    } else {
      const parentSection = await models.EducationForm.findOne({
        where: { id: educationFormId },
      })
      const newSubSection = await parentSection.createEducationForm({
        title: subSectionText,
        type: parentSection.type,
        filetype,
      })
      return {
        subSectionId: newSubSection.id,
        subSectionTitle: newSubSection.title,
        parentId: parentSection.id,
        parentTitle: parentSection.title,
      }
    }
  } else {
    const parentSection = await models.EducationForm.findOne({
      where: { id: educationFormId },
    })
    return {
      subSectionId: parentSection.id,
      subSectionTitle: parentSection.title,
      parentId: parentSection.id,
      parentTitle: parentSection.title,
    }
  }
}

const clearSubSection = async (form, models) => {
  if (form.dataValues.educationFormId !== null) {
    const cntSubSectionRes = await models.EducationResourse.count({
      where: { educationFormId: form.dataValues.id },
    })
    if (cntSubSectionRes === 0) await form.destroy()
  }
}

const educationMutation = {
  async createScheduleYear(parent, { inputData }, { models, auth }) {
    const user = await getUser(auth, models.User)

    const year = await models.ScheduleYear.findOne({ where: { ...inputData } })
    if (year) {
      throw new ApolloError('This year already exists')
    }

    const newYear = await models.ScheduleYear.create({
      ...inputData,
      userCreated: user,
    })
    return { ...newYear.dataValues, timetable: {} }
  },
  async updateScheduleYear(parent, { id, inputData }, { models, auth }) {
    const user = await getUser(auth, models.User)

    const year = await models.ScheduleYear.findOne({ where: { id } })
    if (!year) {
      throw new ApolloError('Year not found')
    }

    year.title = inputData.title
    year.userUpdated = user
    await year.save()
    return year.dataValues
  },
  async deleteScheduleYear(parent, { id }, { models, auth }) {
    const user = await getUser(auth, models.User)

    const year = await models.ScheduleYear.findOne({ where: { id } })
    if (!year) {
      throw new ApolloError('Year not found')
    }

    await year.destroy()
    return id
  },
  async createScheduleTimetable(
    parent,
    { yearId, dayId, inputData },
    { models, auth }
  ) {
    const user = await getUser(auth, models.User)

    const year = await models.ScheduleYear.findOne({ where: { id: yearId } })
    if (!year) {
      throw new ApolloError('This year does not exist ' + yearId)
    }

    const newTime = await models.ScheduleTimetable.create({
      ...inputData,
      yearId,
      dayId,
      userCreated: user,
    })

    if (inputData.isDouble !== 0) {
      const doubleTime = await models.ScheduleTimetable.findOne({
        where: { id: inputData.isDouble },
      })
      doubleTime.isDouble = newTime.id
      doubleTime.save()

      return {
        timetable: {
          ...newTime.dataValues,
          startDate: newTime.startDate && newTime.startDate.toISOString(),
          createdAt: newTime.createdAt.toISOString(),
          updatedAt: newTime.updatedAt.toISOString(),
        },
        double: { id: doubleTime.id, isDouble: newTime.id },
      }
    }

    return {
      timetable: {
        ...newTime.dataValues,
        startDate: newTime.startDate && newTime.startDate.toISOString(),
        createdAt: newTime.createdAt.toISOString(),
        updatedAt: newTime.updatedAt.toISOString(),
      },
    }
  },
  async updateScheduleTimetable(parent, { id, inputData }, { models, auth }) {
    const user = await getUser(auth, models.User)

    const timetable = await models.ScheduleTimetable.findOne({ where: { id } })
    if (!timetable) {
      throw new ApolloError('This lecture does not exist')
    }

    Object.keys(inputData).forEach(item => (timetable[item] = inputData[item]))
    timetable.userUpdated = user
    await timetable.save()
    return {
      ...timetable.dataValues,
      startDate: timetable.startDate && timetable.startDate.toISOString(),
      createdAt: timetable.createdAt.toISOString(),
      updatedAt: timetable.updatedAt.toISOString(),
    }
  },
  async deleteScheduleTimetable(parent, { id }, { models, auth }) {
    const user = await getUser(auth, models.User)

    const timetable = await models.ScheduleTimetable.findOne({ where: { id } })
    if (!timetable) {
      throw new ApolloError('This lecture does not exist')
    }

    const doubleToFind = timetable.isDouble
    await timetable.destroy()

    if (doubleToFind !== 0) {
      const doubleTime = await models.ScheduleTimetable.findOne({
        where: { id: doubleToFind },
      })
      doubleTime.isDouble = 0
      doubleTime.save()
      console.log({ id, double: { id: doubleTime.id, isDouble: 0 } })
      return { id, double: { id: doubleTime.id, isDouble: 0 } }
    }
    return { id }
  },
  async createAdmission(parent, { section, inputData }, { models, auth }) {
    const user = await getUser(auth, models.User)

    // if (!req.isAuth) { throw e}
    const postData = {
      ...inputData,
      section,
    }

    const admission = await models.TextDescription.create({
      ...postData,
      userCreated: user,
    })
    return admission.dataValues
  },
  async updateAdmission(parent, { section, inputData }, { models, auth }) {
    const user = await getUser(auth, models.User)

    const post = await models.TextDescription.findOne({ where: { section } })
    if (!post) {
      throw new ApolloError('admission not found')
    }

    Object.keys(inputData).forEach(item => (post[item] = inputData[item]))
    post.userUpdated = user

    await post.save()
    return post.dataValues
  },
  async deleteAdmission(parent, { section }, { models, auth }) {
    const user = await getUser(auth, models.User)

    const post = await models.TextDescription.findOne({ where: { section } })
    if (!post) {
      throw new ApolloError('admission not found')
    }
    await post.destroy()
    // clearImage(post.dataValues.imageUrl, 'admission')
    return true
  },
  async createEducationCourse(parent, { inputData }, { models, auth }) {
    const user = await getUser(auth, models.User)

    const course = await models.EducationCourse.findOne({
      where: { title: inputData.title },
    })
    if (course) {
      throw new ApolloError('This course already exists')
    }

    const newCourse = await models.EducationCourse.create({
      ...inputData,
      userCreated: user,
    })
    return newCourse
  },
  async updateEducationCourse(parent, { id, inputData }, { models, auth }) {
    const user = await getUser(auth, models.User)

    const course = await models.EducationCourse.findOne({ where: { id } })
    if (!course) {
      throw new ApolloError('Course not found')
    }

    Object.keys(inputData).forEach(item => (course[item] = inputData[item]))
    course.userUpdated = user

    await course.save()
    return course.dataValues
  },
  async deleteEducationCourse(parent, { id }, { models, auth }) {
    const user = await getUser(auth, models.User)

    const course = await models.EducationCourse.findOne({ where: { id } })
    if (!course) {
      throw new ApolloError('Course not found')
    }

    await course.destroy()
    //ADD DELETE ALL RESOURSES
    return id
  },
  async createEducationResourse(
    parent,
    { courseId, filetype, inputData },
    { models, auth }
  ) {
    const user = await getUser(auth, models.User)

    const course = await models.EducationCourse.findOne({
      where: { id: courseId },
    })
    if (!course) {
      throw new ApolloError('Course not found')
    }

    const subSection = await getEducationSubsection(
      inputData.subSectionId,
      inputData.subSectionText,
      inputData.educationFormId,
      models,
      filetype
    )

    let resourse = {}

    if (filetype === 'PDF') {
      const { file, ...postData } = inputData

      const uniqueName = await checkUniqueName(
        inputData.title,
        subSection.parentId,
        models.EducationResourse
      )
      if (!uniqueName)
        throw new ApolloError(
          'Нельзя создать два файла с одинаковым именем в одном разделе'
        )

      const uploadedFile = await inputData.file
      const fileUploadName = `${
        course.title
      } ${subSection.parentTitle.toLowerCase()} ${inputData.title.toLowerCase()}`
      const { file: filePath, fileLink } = await writeImage(
        uploadedFile,
        'education',
        fileUploadName,
        'pdf'
      )

      const postWithFile = {
        ...postData,
        fileLink,
        educationFormId: subSection.subSectionId,
        educationFormIdParent: subSection.parentId,
        educationCourseId: courseId,
        userCreated: user,
        type: filetype,
      }
      resourse = await models.EducationResourse.create({ ...postWithFile })
    } else if (filetype === 'URL') {
      const postData = {
        ...inputData,
        fileLink: inputData.file,
        educationCourseId: courseId,
        educationFormId: subSection.subSectionId,
        educationFormIdParent: subSection.parentId,
        userCreated: user,
        type: filetype,
      }

      resourse = await models.EducationResourse.create({ ...postData })
    }
    const forms = await models.EducationForm.findAll({
      raw: true,
      where: { educationFormId: null },
    })
    return { resourse: resourse.dataValues, forms }
  },

  async updateEducationResourse(
    parent,
    { id, filetype, inputData },
    { models, auth }
  ) {
    const user = await getUser(auth, models.User)

    const resourse = await models.EducationResourse.findOne({ where: { id } })
    if (!resourse) {
      throw new ApolloError('Resourse not found')
    }

    const form = await resourse.getEducationForm()

    const subSection = await getEducationSubsection(
      inputData.subSectionId,
      inputData.subSectionText,
      inputData.educationFormId,
      models,
      filetype
    )
    if (resourse.educationFormId !== subSection.subSectionId) {
      resourse.educationFormId = subSection.subSectionId
      await resourse.save()
      await clearSubSection(form, models)
    }

    const educationCourse = await models.EducationCourse.findOne({
      where: { id: resourse.educationCourseId },
      raw: true,
    })

    if (inputData.title) {
      if (!inputData.file) {
        const uniqueName = await checkUniqueName(
          inputData.title,
          subSection.parentId,
          models.EducationResourse
        )
        if (!uniqueName)
          throw new ApolloError(
            'Нельзя создать два файла с одинаковым именем в одном разделе'
          )

        const fileUploadName = `${
          educationCourse.title
        } ${subSection.parentTitle.toLowerCase()} ${inputData.title.toLowerCase()}`
        const newFileLink = await renameFile(
          resourse.fileLink,
          'education',
          fileUploadName
        )

        resourse.title = inputData.title
        resourse.fileLink = newFileLink
      }
      if (filetype === 'URL') {
        resourse.title = inputData.title
      }
    }
    if (inputData.description) resourse.description = inputData.description
    resourse.userUpdated = user
    await resourse.save()

    if (filetype === 'PDF') {
      let isUploaded = {}

      if (inputData.file) {
        await clearImage(resourse.fileLink, 'education', 'pdf')
        const uploadedFile = await inputData.file
        const fileUploadName = `${
          educationCourse.title
        } ${subSection.parentTitle.toLowerCase()} ${resourse.title.toLowerCase()}`

        isUploaded = await writeImage(
          uploadedFile,
          'education',
          fileUploadName,
          'pdf'
        )
      }

      if (isUploaded.fileLink) {
        resourse.fileLink = isUploaded.fileLink
      }
    } else if (filetype === 'URL') {
      if (inputData.file) resourse.fileLink = inputData.file
    }

    await resourse.save()

    const forms = await models.EducationForm.findAll({
      raw: true,
      where: { educationFormId: null },
    })
    return { resourse: resourse.dataValues, forms }
  },
  async deleteEducationResourse(parent, { id }, { models, auth }) {
    const user = await getUser(auth, models.User)

    const resourse = await models.EducationResourse.findOne({ where: { id } })
    if (!resourse) {
      throw new ApolloError('Resourse not found')
    }

    const form = await resourse.getEducationForm()
    const resourseReturn = resourse.dataValues
    await resourse.destroy()
    if (resourseReturn.type === 'PDF') {
      await clearImage(resourseReturn.fileLink, 'education', 'pdf')
    }

    await clearSubSection(form, models)

    const forms = await models.EducationForm.findAll({
      raw: true,
      where: { educationFormId: null },
    })
    return { resourse: resourseReturn, forms }
  },
}

export default educationMutation
