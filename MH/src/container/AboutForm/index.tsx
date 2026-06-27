/* eslint-disable @next/next/no-img-element */
import React from 'react';

const AboutForm = () => {
  return (
    <div className='mx-auto w-full'>
      <img src='/images/about.svg' alt='x' />
      <div className=' w-full text-center'>
        <img src='/images/about2.svg' alt='x' className='mx-auto mt-[43px]' />
        <div className='mt-[48px] grid grid-cols-2 items-center gap-[48px]'>
          <div className='pl-[109px]'>
            <p className='text-left'>
              Mục tiêu của ACF là trở thành nhà cung cấp hàng đầu trong khu vực
              về dịch vụ ,tổng đại lý cho các hãng hàng không, dịch vụ giao nhận
              vận tải quốc tế, giao nhận hàng hóa xuất nhập khẩu và mạng lưới
              vận tải toàn quốc. Bằng cách đóng vai trò thiết yếu trong việc
              kinh doanh của các khách hàng và cung cấp các dịch vụ kèm theo tốt
              nhất trong hệ thống chuỗi cung ứng, chúng tôi không ngừng nỗ lực
              nhằm mang lại sự hài lòng cho khách hàng. ACF cam kết cung cấp
              dịch vụ với chất lượng tốt nhất cùng với sự minh bạch trong các
              lĩnh vực chúng tôi thực hiện.
            </p>
            <p className='text-left'>
              Ngoài ra, ACF đang có những bước chuyển mình nhằm hướng đến tương
              lai bao gồm phát triển chuyên môn về thương mại điện tử và mô hình
              kinh tế chia sẻ.
            </p>
            <p className='text-left'>
              ACF luôn nỗ lực tìm kiếm các giải pháp sáng tạo cũng như phát
              triển các dịch vụ và sản phẩm mới nhằm cung cấp cho khách hàng các
              giải pháp hiệu quả, sáng tạo với chi phí hợp lý.
            </p>
            <p className='text-left'>
              Thành công ngày hôm nay của chúng tôi có sự đóng góp to lớn từ đội
              ngũ nhân viên chuyên nghiệp và trách nhiệm, đồng thời chất lượng
              cuộc sống ngày càng được nâng cao của nhân viên cũng là thước đo
              mức độ thành công của doanh nghiệp chúng tôi. Ngoài ra, chúng tôi
              không ngừng nỗ lực hoàn thành trách nhiệm đối với xã hội và cộng
              đồng.
            </p>
          </div>
          <img src='/images/about-3.svg' alt='x' />
        </div>

        <div className='mt-[55px]  '>
          <p className='text-[36px] font-bold'>Giá trị của ACF</p>
          <div className='h-[494px] bg-[url(/images/about-4.svg)] pt-[23px] pl-[145px]'>
            <img src='/images/about-5.svg' alt='x' />
          </div>
        </div>

        <div className='mt-[101px]'>
          <p className='m-0 p-0 text-[36px] font-bold'>Lịch sử phát triển</p>
          <p className='text-[16px] font-bold'>
            Những hoạt động ACF đã làm và dự định của chúng mình trong tương lai
          </p>
          <img src='/images/about-6.svg' alt='x' className='mx-auto' />
        </div>
      </div>
    </div>
  );
};

export default AboutForm;
