import { useState } from 'react';

export const PAGE_SIZE = 10;

// Chia danh sách thành trang. Khi resetKey đổi (ô tìm kiếm, bộ lọc, sắp xếp...) tự quay về trang 1.
export function usePagination(items, resetKey = '') {
  const [state, setState] = useState({ page: 1, key: resetKey });

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  // Kẹp lại khi danh sách ngắn đi (lọc, xóa bản ghi)
  const page = Math.min(state.key === resetKey ? state.page : 1, pageCount);
  const firstIndex = (page - 1) * PAGE_SIZE;

  const goToPage = (p) => setState({ page: p, key: resetKey });

  return {
    page,
    pageCount,
    firstIndex,
    total: items.length,
    pageItems: items.slice(firstIndex, firstIndex + PAGE_SIZE),
    goToPage
  };
}
