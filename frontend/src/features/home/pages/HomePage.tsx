import React from 'react';
import { MainLayout } from '@shared/components/layout/MainLayout';
// Import hình ảnh từ thư mục assets
// import EmptyStateIllustration from '@assets/images/home-illustration.png';

export const HomePage = () => {
  return (
    <MainLayout>
      <div className="w-full max-w-3xl flex flex-col items-center justify-center">
        {/* Vị trí đặt hình ảnh minh họa cô gái đang làm việc */}
        <div className="w-full aspect-[16/9] bg-pink-50 rounded-xl flex items-center justify-center border-2 border-dashed border-pink-200">
          <p className="text-pink-400 font-medium">
            nội dung
          </p>
        </div>
      </div>
    </MainLayout>
  );
};