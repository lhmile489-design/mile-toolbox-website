import React, { useState } from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import HotTools from '../components/HotTools';
import Features from '../components/Features';
import MyTools from '../components/MyTools';

export default function HomePage() {
  const [query, setQuery] = useState('');

  const handleSearch = (value) => {
    setQuery(value);
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Hero onSearch={handleSearch} onLiveSearch={setQuery} />
      <MyTools />
      <Categories query={query} />
      <HotTools />
      <Features />
    </>
  );
}
