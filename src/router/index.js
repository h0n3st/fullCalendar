import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import PatientCalendar from '@/components/PatientCalendar'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/patient',
      name: 'PatientCalendar',
      component: PatientCalendar
    }
  ]
})
