"use client";

import SearchToolbar from "@/components/search/SearchToolbar";
import SearchFilterSidebar from "@/components/search/SearchFilterSidebar";
import SearchResultsHeader from "@/components/search/SearchResultsHeader";
import SearchResultsGrid from "@/components/search/SearchResultsGrid";
import SearchEmptyState from "@/components/search/SearchEmptyState";
import SearchPagination from "@/components/search/SearchPagination";
import { useSearchPage } from "@/components/search/useSearchPage";

export default function SearchPage() {
  const {
    t,
    query,
    setQuery,
    setSearchParams,
    selectedCategory,
    setSelectedCategory,
    selectedLevel,
    setSelectedLevel,
    priceFilter,
    setPriceFilter,
    durationFilter,
    setDurationFilter,
    languageFilter,
    setLanguageFilter,
    minRating,
    setMinRating,
    sortBy,
    setSortBy,
    showFilters,
    setShowFilters,
    isListening,
    currentPage,
    setCurrentPage,
    categories,
    loading,
    error,
    currentItems,
    totalPages,
    hasFilters,
    handleVoiceSearch,
    clearFilters,
  } = useSearchPage();

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <SearchToolbar
        query={query}
        placeholder={t("home", "searchPlaceholder")}
        isListening={isListening}
        showFilters={showFilters}
        hasFilters={hasFilters}
        onQueryChange={(value) => {
          setQuery(value);
          setSearchParams(value ? { q: value } : {});
        }}
        onClearQuery={() => {
          setQuery("");
          setSearchParams({});
        }}
        onVoiceSearch={handleVoiceSearch}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className={`grid gap-8 lg:items-start ${showFilters ? "lg:grid-cols-[18rem_minmax(0,1fr)]" : "lg:grid-cols-1"}`}>
          <SearchFilterSidebar
            showFilters={showFilters}
            hasFilters={hasFilters}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
            priceFilter={priceFilter}
            onSelectPrice={setPriceFilter}
            durationFilter={durationFilter}
            onSelectDuration={setDurationFilter}
            languageFilter={languageFilter}
            onSelectLanguage={setLanguageFilter}
            minRating={minRating}
            onSelectRating={setMinRating}
            onClearFilters={clearFilters}
          />

          <main className={`w-full min-w-0 overflow-hidden ${showFilters ? "" : "lg:col-span-full"}`}>
            <SearchResultsHeader query={query} sortedLength={currentItems.length} sortBy={sortBy} onSortChange={(value) => setSortBy(value as typeof sortBy)} />

            {loading ? (
              <div className="rounded-xl border border-gray-200 bg-white py-20 text-center text-gray-500">Đang tải khóa học...</div>
            ) : error ? (
              <div className="rounded-xl border border-gray-200 bg-white py-20 text-center text-gray-500">{error}</div>
            ) : currentItems.length > 0 ? (
              <>
                <SearchResultsGrid courses={currentItems} />
                {totalPages > 1 ? <SearchPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /> : null}
              </>
            ) : (
              <SearchEmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
