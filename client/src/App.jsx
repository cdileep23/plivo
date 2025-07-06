import React from 'react'
import { createBrowserRouter, Router, RouterProvider } from 'react-router-dom'
import Body from './Pages/Body'
import Home from './Pages/Home'
import Auth from './Pages/Auth'
import { Provider } from 'react-redux'
import appStore from './store/store'
import { Toaster } from './components/ui/sonner'
import Services from './Pages/Services'
import EachService from './Pages/EachService'

const App = () => {
  const appRouter=createBrowserRouter([{
    path:'/',
    element:<Body/>,
    children:[
      {
        path:"/",
        element:<Home/>
      },{
        path:"/auth",
        element:<Auth/>
      },{
        path:'/services',
        element:<Services/>
      },{
        path:'/services/:orgId',
        element:<EachService/>
      }
    ]
  }])
  return (
    <main>
      <Toaster/>
      <Provider store={appStore}>
        <RouterProvider router={appRouter} />
      </Provider>
    </main>
  );
}

export default App