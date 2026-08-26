import AP_ContentEditor from "@/app/components/AP_ContentEditor";
import { getContent } from "@/shared/store";

export default async function AP_AdminProductsScreen() {
  const [en, ar] = await Promise.all([getContent("en"), getContent("ar")]);
  return <AP_ContentEditor initialEn={en} initialAr={ar} mode="products" />;
}
