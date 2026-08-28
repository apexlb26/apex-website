import AP_ContentEditor from "@/app/components/AP_ContentEditor";
import { getContentWithVersion } from "@/shared/store";

export default async function AP_AdminProductsScreen() {
  const [en, ar] = await Promise.all([getContentWithVersion("en"), getContentWithVersion("ar")]);
  return (
    <AP_ContentEditor
      initialEn={en.content}
      initialAr={ar.content}
      initialVersions={{ en: en.version, ar: ar.version }}
      mode="products"
    />
  );
}
