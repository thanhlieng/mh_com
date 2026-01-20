import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { RolesService } from '../../modules/roles/roles.service';
import { UsersService } from '../../modules/users/users.service';
import { UsersRole } from '../constants/user-role.constants';
import { CreateRolesDto } from 'src/modules/roles/dto/create-roles.dto';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { CompaniesService } from 'src/modules/companies/companies.service';
import { UnitsService } from 'src/modules/units/units.service';
import { ICategoryPost } from 'src/modules/posts/interfaces/category-post.interface';
import { PostsService } from 'src/modules/posts/posts.service';
import { IHomepage } from 'src/modules/homepage/interface/homepage.interface';
import { appConfig } from 'src/configs/configs.constants';
import { EHomePage, ETypeLinkHomepage } from '../constants/common.constants';
import { HomepageService } from 'src/modules/homepage/homepage.service';
import { ECategoryKey } from 'src/modules/categories/categories.constant';
import { ICategory } from 'src/modules/categories/interfaces/categories.interface';
import { CategoriesService } from 'src/modules/categories/services/categories.service';

@Injectable()
export class GlobalSeed {
  constructor(
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
    private readonly unitsService: UnitsService,
    private readonly postsService: PostsService,
    private readonly homepageService: HomepageService,
    private readonly categoryService: CategoriesService,
  ) {}

  @Command({ command: 'create:user', describe: 'create supper admin' })
  async createUser() {
    try {
      for (const role in UsersRole) {
        const checkExist = await this.rolesService.findByRoleName(
          UsersRole[role],
        );
        if (!checkExist) {
          const createRoleDto: CreateRolesDto = {
            name: UsersRole[role],
            active: true,
            permissions: [],
          };
          await this.rolesService.create(createRoleDto);
        }
      }
      const roleAdmin = await this.rolesService.findByRoleName(UsersRole.ADMIN);
      /// create user admin ///
      const createUserDto: CreateUserDto = {
        username: 'mhgreatsun',
        password: 'mhgreatsun',
        roleId: roleAdmin.id,
      };
      await this.usersService.create(createUserDto);

      console.log('--------- Create user successfully ---------');
    } catch (error) {}
  }

  @Command({ command: 'create:company', describe: 'create company and unit' })
  async createCompanyUnit() {
    try {
      const listCompany = [
        'Công ty TNHH Thương Mại và Dịch vụ ACF',
        'Công ty TNHH WORLDWIDE SHIPPING',
        'CÔNG TY TNHH CHUYỂN PHÁT HỆ THỐNG QUỐC TẾ',
        'CÔNG TY CỔ PHẦN QUỐC TẾ ITS TOÀN CẦU',
      ];
      const listUnit = [
        'TTGD An Giang',
        'TTGD Bà Rịa – Vũng Tàu',
        'TTGD Bạc Liêu',
        'TTGD Bắc Giang',
        'TTGD Bắc Kạn',
        'TTGD Bắc Ninh',
        'TTGD Bến Tre',
        'TTGD Bình Dương',
        'TTGD Bình Định',
        'TTGD Bình Phước',
        'TTGD Bình Thuận',
        'TTGD Cà Mau',
        'TTGD Cao Bằng',
        'TTGD Cần Thơ',
        'TTGD Đà Nẵng',
        'TTGD Đắk Lắk',
        'TTGD Đắk Nông',
        'TTGD Điện Biên',
        'TTGD Đồng Nai',
        'TTGD Đồng Tháp',
        'TTGD Gia Lai',
        'TTGD Hà Giang',
        'TTGD Hà Nam',
        'TTGD Hà Nội',
        'TTGD Hà Tĩnh',
        'TTGD Hải Dương',
        'TTGD Hải Phòng',
        'TTGD Hậu Giang',
        'TTGD Hòa Bình',
        'TTGD Thành phố Hồ Chí Minh',
        'TTGD Hưng Yên',
        'TTGD Khánh Hòa',
        'TTGD Kiên Giang',
        'TTGD Kon Tum',
        'TTGD Lai Châu',
        'TTGD Lạng Sơn',
        'TTGD Lào Cai',
        'TTGD Lâm Đồng',
        'TTGD Long An',
        'TTGD Nam Định',
        'TTGD Nghệ An',
        'TTGD Ninh Bình',
        'TTGD Ninh Thuận',
        'TTGD Phú Thọ',
        'TTGD Phú Yên',
        'TTGD Quảng Bình',
        'TTGD Quảng Nam',
        'TTGD Quảng Ngãi',
        'TTGD Quảng Ninh',
        'TTGD Quảng Trị',
        'TTGD Sóc Trăng',
        'TTGD Sơn La',
        'TTGD Tây Ninh',
        'TTGD Thái Bình',
        'TTGD Thái Nguyên',
        'TTGD Thanh Hóa',
        'TTGD Thừa Thiên Huế',
        'TTGD Tiền Giang',
        'TTGD Trà Vinh',
        'TTGD Tuyên Quang',
        'TTGD Vĩnh Long',
        'TTGD Vĩnh Phúc',
        'TTGD Yên Bái',
      ];

      await this.companiesService.createListCompany(listCompany);
      await this.unitsService.createListUnit(listUnit);
    } catch (error) {}
  }

  @Command({ command: 'create:category', describe: 'create category' })
  async createCategory() {
    // Delivery Conditions
    const deliveryConditions = [
      {
        name: 'DDU - Delivered Duty Unpaid-Giao Hàng Chưa Nộp Thuế',
      },
      {
        name: 'CIF- Cost, Insurance and Freight – Tiền hàng, bảo hiểm và cước phí.',
      },
      {
        name: 'CFR – Cost and Freight – Tiền hàng và cước phí.',
      },
      {
        name: 'FOB – Free On Board – Giao lên tàu.',
      },
      {
        name: 'FAS – Free Alongside Ship – Giao tại mạn tàu.',
      },
      {
        name: 'DDP – Delivered Duty Paid – Giao hàng đã nộp thuế.',
      },
      {
        name: 'DAP – Delivered At Place – Giao tại nơi đến.',
      },
      {
        name: 'DAT – Delivered At Terminal – Giao tại bến.',
      },
      {
        name: 'CIP – Carriage and Insurance Paid To – Cước phí và bảo hiểm trả tới.',
      },
      {
        name: 'CPT – Carriage Paid To – Cước phí trả tới.',
      },
      {
        name: 'FCA – Free Carrier – Giao cho người chuyên chở.',
      },
      {
        name: 'EXW – Ex Works – Giao tại xưởng.',
      },
    ];

    // Currency Unit
    const currencyUnit = [
      {
        name: 'USD - Đô la Mỹ',
      },
      {
        name: 'AUD - Đô la Úc',
      },
      {
        name: 'CHF - Đồng Frank Thụy Sĩ',
      },
      {
        name: 'JPY - Đồng Yên Nhật',
      },
      {
        name: 'CAD - Đô la Canada',
      },
      {
        name: 'NZD - Đô la New Zealand',
      },
      {
        name: 'EUR - Euro',
      },
      {
        name: 'GBP - Bảng Anh',
      },
      {
        name: 'SEK - Đồng Thụy Điển',
      },
      {
        name: 'DKK - Đồng Đan Mạch',
      },
      {
        name: 'NOK - Krone Na Uy',
      },
      {
        name: 'SGD - Đồng đô la Singapore',
      },
      {
        name: 'CZK - Cron Séc',
      },
      {
        name: 'HKD - Đô la Hồng Công',
      },
      {
        name: 'MXN - Peso Mehico',
      },
      {
        name: 'PLN - Zloto Ba Lan',
      },
      {
        name: 'RUB - Rúp Nga',
      },
      {
        name: 'TRY - Lir Thổ Nhĩ Kỳ',
      },
      {
        name: 'ZAR - Rand của Nam Phi',
      },
      {
        name: 'CNH - Nhân dân tệ',
      },
      {
        name: 'VND - Đồng Việt Nam',
      },
    ];

    // Level staff
    const levelStaff = [
      {
        name: 'Lao động tự do',
      },
      {
        name: 'Thạc sĩ',
      },
      {
        name: 'Đại học',
      },
      {
        name: 'Cao đẳng',
      },
      {
        name: 'Trung cấp',
      },
      {
        name: 'Trung học phổ thông',
      },
    ];

    //Commodities type
    const commoditiesType = [
      {
        name: 'Chứng từ',
      },
      {
        name: 'May mặc',
      },
      {
        name: 'Cơ khí',
      },
      {
        name: 'Linh kiện điện tử',
      },
      {
        name: 'Nhựa, cao su',
      },
      {
        name: 'Thực phẩm',
      },
      {
        name: 'Khác',
      },
    ];

    // init categories
    const categories: ICategory[] = [
      {
        name: 'MÃ BẢNG GIÁ CỐ ĐỊNH',
        key: ECategoryKey.FIXED_PRICE_LIST_CODE,
        items: [
          {
            name: 'P1',
          },
          {
            name: 'P2',
          },
          {
            name: 'P3',
          },
          {
            name: 'P4',
          },
          {
            name: 'P5',
          },
          {
            name: 'P6',
          },
          {
            name: 'P7',
          },
          {
            name: 'P8',
          },
          {
            name: 'P9',
          },
          {
            name: 'P10',
          },
          {
            name: 'Giá khác',
            isDefault: true,
            key: 'OTHER_PRICE',
          },
        ],
      },
    ];

    await this.categoryService.initCategories(categories);
  }

  @Command({ command: 'create:homepage', describe: 'Create homepage' })
  async createHomepage() {
    console.log(
      '================= RUNNING CREATE HOMEPAGE ========================',
    );
    //
    ////// Create options Header
    //

    // Create categories
    const listCategoriesHeader: ICategoryPost[] = [
      {
        nameVi: 'Dịch vụ sản phẩm',
        nameEn: 'Products and services',
        active: true,
        thumbnail:
          'https://acf-vn.s3.ap-southeast-1.amazonaws.com/images/Control-V_42240a68-3e22-4b94-9c31-cfec8df664b1.png',
      },
      {
        nameVi: 'Hỗ trợ khách hàng',
        nameEn: 'Customer supports',
        active: true,
        thumbnail:
          'https://acf-vn.s3.ap-southeast-1.amazonaws.com/images/Control-V_42240a68-3e22-4b94-9c31-cfec8df664b1.png',
      },
      {
        nameVi: 'Tra cứu và Báo giá',
        nameEn: 'Lookup and Quote',
        active: true,
        thumbnail:
          'https://acf-vn.s3.ap-southeast-1.amazonaws.com/images/Control-V_42240a68-3e22-4b94-9c31-cfec8df664b1.png',
      },
      {
        nameVi: 'Về chúng tôi',
        nameEn: 'About us',
        active: true,
        thumbnail:
          'https://acf-vn.s3.ap-southeast-1.amazonaws.com/images/Control-V_42240a68-3e22-4b94-9c31-cfec8df664b1.png',
      },
      {
        nameVi: 'Hỗ trợ thông tin',
        nameEn: 'Support information',
        active: true,
        thumbnail:
          'https://acf-vn.s3.ap-southeast-1.amazonaws.com/images/Control-V_42240a68-3e22-4b94-9c31-cfec8df664b1.png',
      },
      {
        nameVi: 'Cơ hội nghề nghiệp',
        nameEn: 'Career opportunities',
        active: true,
        thumbnail:
          'https://acf-vn.s3.ap-southeast-1.amazonaws.com/images/Control-V_42240a68-3e22-4b94-9c31-cfec8df664b1.png',
      },
    ];
    const result = await this.postsService.createCategoryPostSeed(
      listCategoriesHeader,
    );

    //Create top homepage
    const topsLink: IHomepage[] = [
      {
        active: true,
        nameVi: 'Chính sách',
        nameEn: 'Policy',
        link: `${appConfig.webUrl}/policy`,
        position: 0,
        type: EHomePage.TOP,
        typeLink: ETypeLinkHomepage.LINK,
      },
      {
        active: true,
        nameVi: 'Điều khoản sử dụng',
        nameEn: 'Terms of use',
        link: `${appConfig.webUrl}/terms-of-use`,
        position: 1,
        type: EHomePage.TOP,
        typeLink: ETypeLinkHomepage.LINK,
      },
      {
        active: true,
        nameVi: 'Điện thoại liên lạc: (+84) 968022257',
        nameEn: 'Contact phone: (+84) 968022257',
        position: 2,
        type: EHomePage.TOP,
        typeLink: ETypeLinkHomepage.LINK,
      },
      {
        active: true,
        nameVi: 'Hotline: 19008972',
        nameEn: 'Hotline: 19008972',
        position: 3,
        type: EHomePage.TOP,
        typeLink: ETypeLinkHomepage.LINK,
      },
    ];
    await this.homepageService.createHomepageSeed(topsLink);

    //Create header homepage
    const headers: IHomepage[] = [];
    for (let i = 0; i < result.length; i++) {
      headers.push({
        active: true,
        nameVi: result[i].nameVi,
        nameEn: result[i].nameEn,
        position: i,
        type: EHomePage.HEADER,
        typeLink: ETypeLinkHomepage.CATEGORY,
        categoryId: result[i].id,
      });
    }

    await this.homepageService.createHomepageSeed(headers);

    //
    /////// Create options Body
    //

    //
    ////////// Create options Footer
    //

    console.log(
      '================= CREATE HOMEPAGE SUCCESSFULLY ===================',
    );
  }
}
