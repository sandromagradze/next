import GlobalScripts from "@/components/GlobalScripts/GlobalScripts";
import Header from "@/components/Header/Header";
import Navbar from "@/components/Navbar/Navbar";
import ScrollButton from "@/components/ScrollButton/ScrollButton";
import { fetchMenu } from "@/lib/api/menu";

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    lang: string;
  }>;
}

export default async function LangLayout({
  children,
  params,
}: LangLayoutProps) {
  const { lang } = await params;

  const menuData = await fetchMenu(lang);

  return (
    <>
      <GlobalScripts lang={lang} />

      <Header lang={lang} />

      <Navbar
        lang={lang}
        menu={menuData.menu}
      />

      {children}

      <ScrollButton />
    </>
  );
}