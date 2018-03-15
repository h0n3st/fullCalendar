import Vue from 'vue'
import Router from 'vue-router'
import StaffCalendar from '@/components/StaffCalendar'
import PatientCalendar from '@/components/PatientCalendar'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'StaffCalendar',
      component: StaffCalendar
    },
    {
      path: '/patient',
      name: 'PatientCalendar',
      component: PatientCalendar
    }
  ]
})
