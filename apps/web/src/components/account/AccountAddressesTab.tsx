"use client";

import { useEffect, useState } from "react";
import { MapPin, Trash2 } from "lucide-react";
import { useI18n } from "@/app/providers";
import { createAddress, deleteAddress, fetchAddresses, type AddressDto } from "@/services/api";
import { toast } from "@/lib/notify";

export default function AccountAddressesTab() {
  const { tx } = useI18n();
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: "", phone: "", address: "", city: "" });

  const loadAddresses = async () => {
    setLoading(true);
    try {
      setAddresses(await fetchAddresses());
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address || !newAddress.city) {
      toast.error(tx("Please fill in all required fields.", "Vui lòng điền đầy đủ thông tin"));
      return;
    }
    try {
      await createAddress({
        recipientName: newAddress.name,
        phone: newAddress.phone,
        line1: newAddress.address,
        city: newAddress.city,
        country: "Vietnam",
        isDefault: addresses.length === 0,
      });
      setNewAddress({ name: "", phone: "", address: "", city: "" });
      setIsAdding(false);
      await loadAddresses();
      toast.success(tx("New address added successfully!", "Địa chỉ mới đã được thêm!"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tx("Unable to add address.", "Không thể thêm địa chỉ"));
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await deleteAddress(id);
      await loadAddresses();
      toast.success(tx("Address deleted.", "Địa chỉ đã được xóa!"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tx("Unable to delete address.", "Không thể xóa địa chỉ"));
    }
  };

  return (
    <div>
      <h2 className="mb-5 text-lg font-semibold text-gray-900">{tx("My addresses", "Địa chỉ của tôi")}</h2>
      {loading ? (
        <div className="py-10 text-center text-gray-500">{tx("Loading addresses...", "Đang tải địa chỉ...")}</div>
      ) : addresses.length === 0 ? (
        <div className="py-12 text-center">
          <MapPin className="mx-auto mb-3 size-12 text-gray-200" />
          <p className="text-sm text-gray-500">{tx("No addresses yet", "Chưa có địa chỉ nào")}</p>
          <button onClick={() => setIsAdding(true)} className="mt-2 inline-block text-sm text-blue-600 hover:underline">
            {tx("Add new address", "Thêm địa chỉ mới")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="overflow-hidden rounded-xl border border-gray-200">
              <div className="flex items-center justify-between gap-3 bg-gray-50 px-4 py-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-gray-900">{addr.recipientName}</p>
                  <p className="text-xs text-gray-500">{addr.phone}</p>
                </div>
                <button onClick={() => handleDeleteAddress(addr.id)} className="text-sm text-red-500 hover:text-red-600">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="space-y-2 p-4">
                <p className="truncate text-sm text-gray-800">
                  {addr.line1}, {addr.city}
                </p>
              </div>
            </div>
          ))}
          <button onClick={() => setIsAdding(true)} className="mt-2 inline-block text-sm text-blue-600 hover:underline">
            {tx("Add new address", "Thêm địa chỉ mới")}
          </button>
        </div>
      )}
      {isAdding ? (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-medium text-gray-700">{tx("Add address", "Thêm địa chỉ mới")}</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">{tx("Full name", "Họ và tên")}</label>
              <input
                value={newAddress.name}
                onChange={(e) => setNewAddress((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">{tx("Phone number", "Số điện thoại")}</label>
              <input
                value={newAddress.phone}
                onChange={(e) => setNewAddress((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-500">{tx("Address", "Địa chỉ")}</label>
              <textarea
                value={newAddress.address}
                onChange={(e) => setNewAddress((f) => ({ ...f, address: e.target.value }))}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-500">{tx("City", "Thành phố")}</label>
              <input
                value={newAddress.city}
                onChange={(e) => setNewAddress((f) => ({ ...f, city: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleAddAddress}
            className="mt-3 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {tx("Add address", "Thêm địa chỉ")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
