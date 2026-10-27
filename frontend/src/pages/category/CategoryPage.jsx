import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ProductBrowser from '../shop/ProductBrowser'
import { PageHeader } from '../../components/common/ui'

const CategoryPage = () => {
  const { categoryName } = useParams();

  useEffect(() => { window.scrollTo(0, 0) }, [categoryName])

  return (
    <>
      <PageHeader title={categoryName}>Shop {categoryName} from all the stores in the mall.</PageHeader>
      <div className='section__container'>
        {/* key resets the filters when the category in the URL changes */}
        <ProductBrowser key={categoryName} initialCategory={categoryName.toLowerCase()} />
      </div>
    </>
  )
}

export default CategoryPage
