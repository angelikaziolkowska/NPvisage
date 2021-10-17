import './App.css';
import React from 'react'
import { Link, Route, Switch } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ThomasonsAlgorithmPage from './pages/ThomasonsAlgorithmPage'
import GetInvolvedPage from './pages/GetInvolvedPage'
import NewsPage from './pages/NewsPage'

export default function App() {
    return (
        <main className="content">
            <div className="container container-fluid menu-content">
                <h1 className="text-black-50 text-center mt-5 mb-4 p-4 font-weight-bolder">NPvisage</h1>
                <nav className="px-5 navbar navbar-dark main-nav sticky-top">
                    <Link className="px-5 navbar-brand border main" to="/">Home</Link>
                    <Link className="px-5 navbar-brand border main" to="/about">About</Link>
                    <Link className="px-5 navbar-brand border main" to="/thomasons-algorithm">Algorithms</Link>
                    <Link className="px-5 navbar-brand border main" to="/get-involved">Get Involved</Link>
                    <Link className="px-5 navbar-brand border main" to="/news">News</Link>
                </nav>
                { /* Route components are rendered if the path prop matches the current URL */}
                <Route path="/home"><HomePage /></Route>
                <Route path="/about"><AboutPage /></Route>
                <Route path="/thomasons-algorithm"><ThomasonsAlgorithmPage /></Route>
                <Route path="/get-involved"><GetInvolvedPage /></Route>
                <Route path="/news"><NewsPage /></Route>
            </div>
        </main>
    )
}
