import React from "react";
import { createBrowserRouter, Navigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import App from "../App";
import PrivateRoute from "./PrivateRoute";

// shopper site
import Home from "../pages/home/Home";
import CategoryPage from "../pages/category/CategoryPage";
import Search from "../pages/search/Search";
import { ShopPage } from "../pages/shop/ShopPage";
import SingleProduct from "../pages/shop/productDetails/SingleProduct";
import StoresPage from "../pages/stores/StoresPage";
import StorefrontPage from "../pages/stores/StorefrontPage";
import CheckoutPage from "../pages/checkout/CheckoutPage";
import OrderSuccess from "../pages/checkout/OrderSuccess";
import SellPage from "../pages/sell/SellPage";
import OpenStorePage from "../pages/sell/OpenStorePage";
import Login from "../components/Login";
import Register from "../components/Register";

// dashboards
import DashboardLayout from "../pages/dashboard/DashboardLayout";
import UserDashboard from "../pages/dashboard/user/UserDashboard";
import MyOrders from "../pages/dashboard/user/MyOrders";
import Profile from "../pages/dashboard/user/Profile";
import VendorOverview from "../pages/dashboard/vendor/VendorOverview";
import VendorProducts from "../pages/dashboard/vendor/VendorProducts";
import ProductForm from "../pages/dashboard/vendor/ProductForm";
import VendorOrders from "../pages/dashboard/vendor/VendorOrders";
import StoreSettings from "../pages/dashboard/vendor/StoreSettings";
import Subscription from "../pages/dashboard/vendor/Subscription";
import AdminOverview from "../pages/dashboard/admin/AdminOverview";
import AdminStores from "../pages/dashboard/admin/AdminStores";
import AdminUsers from "../pages/dashboard/admin/AdminUsers";
import AdminPlans from "../pages/dashboard/admin/AdminPlans";
import AdminOrders from "../pages/dashboard/admin/AdminOrders";
import AdminPayments from "../pages/dashboard/admin/AdminPayments";

// /dashboard sends each role to its own home
const DashboardHome = () => {
  const { user } = useSelector((s) => s.auth)
  if (user?.role === 'admin') return <Navigate to='/dashboard/admin' replace />
  if (user?.role === 'vendor') return <Navigate to='/dashboard/store' replace />
  return <UserDashboard />
}

const NotFound = () => (
  <section className='section__container text-center'>
    <h2 className='section__header'>Page not found</h2>
    <Link to='/' className='btn inline-block mt-4'>Back to the mall</Link>
  </section>
)

const vendor = (el) => <PrivateRoute roles={['vendor', 'admin']}>{el}</PrivateRoute>
const admin = (el) => <PrivateRoute roles={['admin']}>{el}</PrivateRoute>

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/categories/:categoryName", element: <CategoryPage /> },
      { path: "/search", element: <Search /> },
      { path: "/shop", element: <ShopPage /> },
      { path: "/shop/:id", element: <SingleProduct /> },
      { path: "/stores", element: <StoresPage /> },
      { path: "/stores/:slug", element: <StorefrontPage /> },
      { path: "/sell", element: <SellPage /> },
      { path: "/sell/open", element: <PrivateRoute><OpenStorePage /></PrivateRoute> },
      { path: "/checkout", element: <PrivateRoute><CheckoutPage /></PrivateRoute> },
      { path: "/order-success/:checkoutId", element: <PrivateRoute><OrderSuccess /></PrivateRoute> },
      { path: "*", element: <NotFound /> },
    ]
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/dashboard",
    element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
    children: [
      { index: true, element: <DashboardHome /> },
      { path: "orders", element: <MyOrders /> },
      { path: "profile", element: <Profile /> },

      // store owner
      { path: "store", element: vendor(<VendorOverview />) },
      { path: "store/products", element: vendor(<VendorProducts />) },
      { path: "store/products/new", element: vendor(<ProductForm />) },
      { path: "store/products/:id/edit", element: vendor(<ProductForm />) },
      { path: "store/orders", element: vendor(<VendorOrders />) },
      { path: "store/settings", element: vendor(<StoreSettings />) },
      { path: "store/subscription", element: vendor(<Subscription />) },

      // mall admin
      { path: "admin", element: admin(<AdminOverview />) },
      { path: "admin/stores", element: admin(<AdminStores />) },
      { path: "admin/users", element: admin(<AdminUsers />) },
      { path: "admin/plans", element: admin(<AdminPlans />) },
      { path: "admin/orders", element: admin(<AdminOrders />) },
      { path: "admin/payments", element: admin(<AdminPayments />) },
    ]
  },
]);

export default router;
