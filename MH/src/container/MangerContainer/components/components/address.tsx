/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoComplete, Divider, Form, FormInstance, Select } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';

import VInput from '@/components/common/VInput';
import VSelect from '@/components/common/VSelect';
import VTextArea from '@/components/common/VTextarea';
import ShowPostCodeVN from '@/components/ShowPostCodeVN';

import {
  AddressCustomer,
  EAddressBookingType,
  IUser,
  OpitionType,
} from '@/contants/types';
import { countries } from '@/contants/types/Country';
import useGetAddressBook from '@/hook/getAdressBook';
import { getPostalCode } from '@/services/booking.services';
import {
  MAX_14_TEXT,
  MAX_35_TEXT,
  MAX_60_TEXT,
  split35String,
} from '@/utils/common-function';

interface AddressProps {
  form: FormInstance;
  dataUser: IUser | undefined;
  addressCustome: Partial<AddressCustomer> | undefined;
  handleChangeInfoSender: (name: string, value: any) => void;
  handleChangeInfoRecei: (name: string, value: any) => void;
  handleAutoSender: (value: any) => void;
  handleAutoReceive: (value: any) => void;
}

const { Option } = Select;

const Address = ({
  form,
  dataUser,
  addressCustome,
  handleChangeInfoSender,
  handleChangeInfoRecei,
  handleAutoSender,
  handleAutoReceive,
}: AddressProps) => {
  const [search, setSeach] = useState<string | undefined>();
  const [search2, setSeach2] = useState<string | undefined>();
  const { t } = useTranslation('booking');
  const { data: dataPostalCode } = useQuery([search], () =>
    getPostalCode({ search })
  );
  const { data: dataPostalCode2 } = useQuery([search2], () =>
    getPostalCode({ search: search2 })
  );

  const opition = useMemo(() => {
    if (dataPostalCode) {
      return [
        { value: dataPostalCode?.value, label: dataPostalCode?.displayName },
      ];
    } else {
      return [];
    }
  }, [dataPostalCode]);
  const opition2 = useMemo(() => {
    if (dataPostalCode2) {
      return [
        { value: dataPostalCode2?.value, label: dataPostalCode2?.displayName },
      ];
    } else {
      return [];
    }
  }, [dataPostalCode2]);

  const { data: dataSenderAddress } = useGetAddressBook({
    type: EAddressBookingType.SENDER_ADDRESS,
  });

  const { data: dataReceiveAddress } = useGetAddressBook({
    type: EAddressBookingType.RECEIVER_ADDRESS,
  });
  useEffect(() => {
    form.setFieldsValue({
      senderPhoneNumber:
        addressCustome?.senderPhoneNumber || dataUser?.phoneNumber,
      senderContactPerson:
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //  @ts-ignore
        addressCustome?.senderContactPerson || dataUser?.contactPerson,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      senderMobile: addressCustome?.senderMobile || dataUser?.phoneNumber,
      senderCountry: addressCustome?.senderCountry || dataUser?.country,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      senderCommune: addressCustome?.addressCustome || dataUser?.commune,

      senderDistrict: addressCustome?.senderDistrict || dataUser?.district,
      senderProvince: addressCustome?.senderProvince || dataUser?.province,
      senderPostalCode: addressCustome?.senderPostalCode,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      senderState: addressCustome?.senderState || dataUser?.state,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      senderNote: addressCustome?.senderNote || dataUser?.note,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      senderNameEn: addressCustome?.senderNameEn || dataUser?.fullNameEn,

      senderAddressEn:
        addressCustome?.senderAddressEn || dataUser?.detailAddressEn,
    });
  }, []);

  const opitionSenderAddress = useMemo(() => {
    if (!dataSenderAddress) {
      return [];
    } else {
      return dataSenderAddress.map((v) => ({
        value: v.id,
        label: v.senderNameEn,
      }));
    }
  }, [dataSenderAddress]);

  const opitionReceiveAddress = useMemo(() => {
    if (!dataReceiveAddress) {
      return [];
    } else {
      return dataReceiveAddress.map((v) => ({
        value: v.id,
        label: v.receiverName,
      }));
    }
  }, [dataReceiveAddress]);

  const handleSelect = () => {
    form.setFieldValue('senderProvince', dataPostalCode?.cityName);
    form.setFieldValue('senderPostalCode', dataPostalCode?.value);
    form.setFieldValue('senderCountry', dataPostalCode?.countryName);
    form.setFieldValue('senderTown', dataPostalCode?.townName);
  };

  const handleSelect2 = () => {
    form.setFieldValue('receiverProvince', dataPostalCode2?.cityName);
    form.setFieldValue('receiverPostalCode', dataPostalCode2?.value);
    form.setFieldValue('receiverCountry', dataPostalCode2?.countryName);
    form.setFieldValue('receiverTown', dataPostalCode2?.townName);
  };

  const handleChangeMaskUpInput = (value: any) => {
    const val = value?.replace(/^(\d{3})(\d{3})/, '$1-$2');
    handleChangeInfoSender('senderPostalCode', val);
    form.setFieldValue('senderPostalCode', val);
    setSeach(val);
  };
  const handleChangeMaskUpInput2 = (value: any) => {
    const val = value?.replace(/^(\d{3})(\d{3})/, '$1-$2');
    handleChangeInfoSender('receiverPostalCode', val);
    form.setFieldValue('receiverPostalCode', val);
    setSeach2(val);
  };
  return (
    <div className='mb-24 py-[20px]'>
      <Form form={form} className=' grid grid-cols-2 gap-[54px] xs:grid-cols-1'>
        <div>
          <div className=' flex flex-row items-center justify-between xs:grid xs:grid-cols-2'>
            <p className='m-0  mb-[24px] p-0 font-bold'>
              {t("Sender's address")}
            </p>
            <Form.Item name='autoSelectSender'>
              <Select
                className='w-[300px] xs:w-full'
                onChange={handleAutoSender}
                showSearch
                filterOption={(input, option: any) =>
                  option?.props?.children
                    ?.toLowerCase()
                    ?.indexOf(input.toLowerCase()) >= 0 ||
                  option?.props?.value
                    ?.toLowerCase()
                    ?.indexOf(input.toLowerCase()) >= 0
                }
              >
                {opitionSenderAddress.map((v: OpitionType) => (
                  <Option value={v.value} key={v.value}>
                    {v.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Divider />
          <div>
            <Form.Item
              name='senderNameEn'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập Tên công ty gửi',
                },
                {
                  max: 60,
                  message: MAX_60_TEXT,
                },
              ]}
            >
              <VInput
                isHorizal
                label={t("Sender's company name")}
                required
                placeholder={t('Maximum length 60 characters')}
              />
            </Form.Item>

            <Form.Item
              name='senderContactPerson'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập Tên người gửi hàng',
                },
                {
                  max: 35,
                  message: MAX_35_TEXT,
                },
              ]}
            >
              <VInput
                isHorizal
                label={t("Sender's name")}
                required
                placeholder={t('Maximum 35 characters')}
              />
            </Form.Item>

            <Form.Item name='senderDepartment'>
              <VInput isHorizal label={t('Sending department')} />
            </Form.Item>

            <div className='grid grid-cols-2 gap-4 xs:grid-cols-1'>
              <Form.Item name='senderCountry'>
                <VSelect
                  label={t('Country')}
                  required
                  isHorizal
                  showSearch
                  onChange={(e) => handleChangeInfoSender('senderCountry', e)}
                >
                  {countries.map((v) => (
                    <Option value={v.value} key={v.value}>
                      {v.label}
                    </Option>
                  ))}
                </VSelect>
              </Form.Item>

              <div className='space-y-1'>
                <p className='m-0 p-0'>
                  {t('Postal code')}
                  <span className='text-red-700'>*</span>
                </p>

                <Form.Item
                  name='senderPostalCode'
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập Mã bưu chính (postcode)',
                    },
                  ]}
                >
                  <AutoComplete
                    options={opition}
                    onSelect={handleSelect}
                    maxLength={8}
                    placeholder='XXX-XXX'
                    onSearch={handleChangeMaskUpInput}
                    onKeyDown={(e) =>
                      handleChangeMaskUpInput((e.target as any).value)
                    }
                  />
                </Form.Item>
                <ShowPostCodeVN />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 '>
              <Form.Item
                name='senderProvince'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập Tỉnh/Thành phố',
                  },
                  {
                    max: 35,
                    message: MAX_35_TEXT,
                  },
                ]}
              >
                <VInput
                  isHorizal
                  required
                  label={t('Province')}
                  placeholder={t('Maximum 35 characters')}
                  onChange={(e) => {
                    handleChangeInfoSender('senderProvince', e.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item
                name='senderTown'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập quận huyện',
                  },
                  {
                    max: 35,
                    message: MAX_35_TEXT,
                  },
                ]}
              >
                <VInput
                  isHorizal
                  required
                  label={t('City/District/County')}
                  onChange={(e) =>
                    handleChangeInfoSender('senderTown', e.target.value)
                  }
                />
              </Form.Item>
            </div>

            <Form.Item
              name='senderAddressEn1'
              validateTrigger={['onBlur', 'onFocus', 'onChange']}
              rules={[
                {
                  required: true,
                  message: `Vui lòng nhập ${t('Detailed address 1')}`,
                },
              ]}
            >
              <VInput
                isHorizal
                label={t('Detailed address 1')}
                required={true}
                placeholder={t(
                  'Maximum length of 35 characters if longer to address 2'
                )}
                onChange={(e) => {
                  handleChangeInfoSender('senderAddressEn1', e.target.value);
                  split35String(
                    35,
                    e.target.value,
                    form,
                    'senderAddressEn1',
                    'senderAddressEn2'
                  );
                }}
              />
            </Form.Item>
            <Form.Item
              name='senderAddressEn2'
              validateTrigger={['onBlur', 'onFocus', 'onChange']}
              dependencies={['senderAddressEn1']}
              validateFirst
              rules={[
                () => ({
                  validator(_, value) {
                    if (value?.length > 35) {
                      return Promise.reject(
                        new Error(t('Maximum 35 characters'))
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <VInput
                isHorizal
                label={t('DetailedAddress2')}
                placeholder={t('Maximum 35 characters')}
                onChange={(e) => {
                  handleChangeInfoSender('senderAddressEn2', e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item
              name='senderAddressEn3'
              rules={[
                {
                  max: 35,
                  message: MAX_35_TEXT,
                },
              ]}
            >
              <VInput
                isHorizal
                placeholder={t('Maximum 35 characters')}
                label={t('DetailedAddress3')}
                onChange={(e) => {
                  handleChangeInfoSender('senderAddressEn3', e.target.value);
                }}
              />
            </Form.Item>
            <div className='grid grid-cols-2 gap-4 xs:grid-cols-1'>
              <Form.Item
                name='senderPhoneNumber'
                rules={[
                  {
                    required: true,
                    message: t('Sending phone number'),
                  },
                  {
                    max: 14,
                    message: MAX_14_TEXT,
                  },
                ]}
              >
                <VInput
                  isHorizal
                  label={t('Sending phone number')}
                  required
                  placeholder={t('Maximum 14 characters')}
                  onChange={(e) =>
                    handleChangeInfoSender('senderPhoneNumber', e.target.value)
                  }
                />
              </Form.Item>
              <Form.Item
                name='senderPhoneNumber2'
                rules={[
                  {
                    max: 14,
                    message: MAX_14_TEXT,
                  },
                ]}
              >
                <VInput
                  isHorizal
                  label={t('Sending Phone Number 2')}
                  placeholder={t('Maximum 14 characters')}
                  onChange={(e) =>
                    handleChangeInfoSender('senderPhoneNumber', e.target.value)
                  }
                />
              </Form.Item>
            </div>
            <Form.Item name='senderOtherShippingAddress'>
              <VTextArea
                isHorizal
                label={t(
                  "Shipping address is different from the sender's address (if any)"
                )}
                placeholder={`${t('IF THERE')}
- ${t('SENDING COMPANY NAME')}
- ${t('DETAILED ADDRESS')}
- ${t('SENDER NAME')}
- ${t('SENDER PHONE NUMBER')}
                `}
                rows={6}
              />
            </Form.Item>
            <Form.Item name='senderNote'>
              <VTextArea isHorizal label={t('Note (Sender)')} rows={6} />
            </Form.Item>
          </div>
        </div>

        <div>
          <div className=' flex flex-row items-center justify-between  xs:grid xs:grid-cols-2'>
            <p className='m-0  mb-[24px] p-0 font-bold'>
              {t("Recipient's address")}
            </p>
            <Form.Item name='autoSelectReceive'>
              <Select
                className='w-[300px] xs:w-full'
                onChange={handleAutoReceive}
                showSearch
                filterOption={(input, option: any) =>
                  option?.props?.children
                    ?.toLowerCase()
                    ?.indexOf(input.toLowerCase()) >= 0 ||
                  option?.props?.value
                    ?.toLowerCase()
                    ?.indexOf(input.toLowerCase()) >= 0
                }
              >
                {opitionReceiveAddress.map((v: OpitionType) => (
                  <Option value={v.value} key={v.value}>
                    {v.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Divider />
          <div>
            <Form.Item
              name='receiverName'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập Tên công ty nhận',
                },
                {
                  max: 60,
                  message: MAX_60_TEXT,
                },
              ]}
            >
              <VInput
                label={t('Receiving company name')}
                placeholder={t('Maximum 60 characters')}
                required
                isHorizal
                onChange={(e) => {
                  handleChangeInfoRecei('receiverName', e.target.value);
                }}
              />
            </Form.Item>

            <Form.Item
              name='receiverContactPerson'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập Người nhận hàng',
                },
                {
                  max: 35,
                  message: MAX_35_TEXT,
                },
              ]}
            >
              <VInput
                isHorizal
                label={t('Recipient')}
                placeholder={t('Maximum 35 characters')}
                required
              />
            </Form.Item>

            <Form.Item name='receiverDepartment'>
              <VInput isHorizal label={t('Receiving department')} />
            </Form.Item>

            <div className='grid grid-cols-2 gap-4 xs:grid-cols-1'>
              <Form.Item
                name='receiverCountry'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập quốc gia',
                  },
                ]}
              >
                <VSelect
                  label={t('Country')}
                  required
                  isHorizal
                  showSearch
                  onChange={(e) => handleChangeInfoRecei('receiverCountry', e)}
                >
                  {countries.map((v) => (
                    <Option value={v.value} key={v.value}>
                      {v.label}
                    </Option>
                  ))}
                </VSelect>
              </Form.Item>

              <div className='space-y-1'>
                <p className='m-0 p-0'>
                  {t('Postal code')}
                  <span className='text-red-700'>*</span>
                </p>

                <Form.Item
                  name='receiverPostalCode'
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập Mã bưu chính (postcode)',
                    },
                  ]}
                >
                  <AutoComplete
                    options={opition2}
                    onSelect={handleSelect2}
                    maxLength={8}
                    placeholder='XXX-XXXX'
                    data-pattern='xx/xxxx'
                    onSearch={handleChangeMaskUpInput2}
                    onKeyDown={(e) =>
                      handleChangeMaskUpInput2((e.target as any).value)
                    }
                  />
                </Form.Item>
              </div>
            </div>
            <div className='grid grid-cols-1 gap-4 xs:grid-cols-1'>
              <Form.Item
                name='receiverProvince'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập Tỉnh',
                  },
                  {
                    max: 35,
                    message: MAX_35_TEXT,
                  },
                ]}
              >
                <VInput
                  isHorizal
                  required
                  label={t('Province')}
                  placeholder={t('Maximum 35 characters')}
                  onChange={(e) =>
                    handleChangeInfoRecei('receiverProvince', e.target.value)
                  }
                />
              </Form.Item>

              <Form.Item
                name='receiverTown'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập quận huyện',
                  },
                  {
                    max: 35,
                    message: MAX_35_TEXT,
                  },
                ]}
              >
                <VInput
                  isHorizal
                  placeholder={t('Maximum 35 characters')}
                  required
                  label={t('City/District/County')}
                  onChange={(e) =>
                    handleChangeInfoRecei('receiverTown', e.target.value)
                  }
                />
              </Form.Item>
            </div>

            <Form.Item
              name='receiverAddress1'
              validateTrigger={['onBlur', 'onFocus', 'onChange']}
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập Địa chỉ nhận hàng chi tiết 1',
                },
              ]}
            >
              <VInput
                label={t('Detailed receiving address 1')}
                required
                isHorizal
                placeholder={t('Maximum 35 characters')}
                onChange={(e) => {
                  split35String(
                    35,
                    e.target.value,
                    form,
                    'receiverAddress1',
                    'receiverAddress2'
                  );
                  handleChangeInfoRecei('receiverAddress1', e.target.value);
                }}
              />
            </Form.Item>

            <Form.Item
              name='receiverAddress2'
              validateTrigger={['onBlur', 'onFocus', 'onChange']}
              rules={[
                () => ({
                  validator(_, value) {
                    if (value?.length > 35) {
                      return Promise.reject(
                        new Error('Độ dài tối đa 35 kí tự')
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <VInput
                label={t('Detailed receiving address 2')}
                isHorizal
                placeholder={t('Maximum 35 characters')}
                onChange={(e) => {
                  handleChangeInfoRecei('receiverAddress2', e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item
              name='receiverAddress3'
              rules={[
                {
                  max: 35,
                  message: MAX_35_TEXT,
                },
              ]}
            >
              <VInput
                label={t('Detailed receiving address 3')}
                isHorizal
                placeholder={t('Maximum 35 characters')}
                onChange={(e) =>
                  handleChangeInfoRecei('receiverAddress3', e.target.value)
                }
              />
            </Form.Item>

            <div className='grid grid-cols-2 gap-4 xs:grid-cols-1'>
              <Form.Item
                name='receiverPhoneNumber'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập SĐT người nhận',
                  },
                  {
                    max: 14,
                    message: MAX_14_TEXT,
                  },
                ]}
              >
                <VInput
                  isHorizal
                  label={t("Recipient's phone number")}
                  required
                  placeholder={t('Maximum 14 characters')}
                  onChange={(e) =>
                    handleChangeInfoRecei('receiverPhoneNumber', e.target.value)
                  }
                />
              </Form.Item>
              <Form.Item
                name='receiverPhoneNumber2'
                rules={[
                  {
                    max: 14,
                    message: MAX_14_TEXT,
                  },
                ]}
              >
                <VInput
                  isHorizal
                  label={t("Recipient's phone number 2")}
                  placeholder={t('Maximum 14 characters')}
                  onChange={(e) =>
                    handleChangeInfoRecei(
                      'receiverPhoneNumber2',
                      e.target.value
                    )
                  }
                />
              </Form.Item>
            </div>

            <Form.Item name='receiverNote'>
              <VTextArea isHorizal label={t('Note (Recipient)')} rows={6} />
            </Form.Item>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default Address;
