import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage = 10 }) => {
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || 
      i === totalPages || 
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push('...');
    }
  }

  // Remove duplicate '...'
  const filteredPages = pages.filter((item, index) => {
    return item !== '...' || pages[index - 1] !== '...';
  });

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.25rem 1.5rem',
      borderTop: '1px solid var(--border)',
      backgroundColor: 'var(--bg-card)',
      fontSize: '0.875rem'
    }}>
      <div style={{ color: 'var(--text-muted)' }}>
        Showing <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{startIdx}</span> to <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{endIdx}</span> of <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{totalItems}</span> results
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn"
          style={{
            padding: '0.5rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            color: currentPage === 1 ? 'var(--text-light)' : 'var(--text-main)',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ChevronLeft size={18} />
        </button>

        {filteredPages.map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className="btn"
            style={{
              width: '36px',
              height: '36px',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              cursor: typeof page === 'number' ? 'pointer' : 'default',
              fontWeight: '600',
              backgroundColor: page === currentPage ? 'var(--primary)' : 'transparent',
              color: page === currentPage ? 'white' : 'var(--text-main)',
              border: page === currentPage ? 'none' : '1px solid transparent',
              transition: 'var(--transition)'
            }}
            onMouseEnter={e => {
              if (page !== currentPage && typeof page === 'number') {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }
            }}
            onMouseLeave={e => {
              if (page !== currentPage && typeof page === 'number') {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }
            }}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn"
          style={{
            padding: '0.5rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            color: currentPage === totalPages ? 'var(--text-light)' : 'var(--text-main)',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
