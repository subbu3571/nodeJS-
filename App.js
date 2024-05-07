
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import ShopCategory from './Pages/ShopCategory';
import Product from './Pages/Product';
import LoginSignup from './Pages/LoginSignup';
import Home from './Pages/Home';
import Cart from './Pages/Cart';
import Footer from './Footer/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';


function App() {
  return (
    <div>
      <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/Plant' element={<ShopCategory category="Plant"/>}/>
        <Route path='/Seeds' element={<ShopCategory category="Seeds"/>}/>
        <Route path='/Pots' element={<ShopCategory category="Pots"/>}/>
        <Route path='/product' element={<Product/>}>
        <Route path=':productId' element={<Product/>}/>
        </Route>
        <Route path='/Cart' element={<Cart/>}/>
        <Route path='/login' element={<LoginSignup/>}/>

        </Routes>
        <Footer/>
      </BrowserRouter>
      
      
    </div>
  );
}

export default App;
