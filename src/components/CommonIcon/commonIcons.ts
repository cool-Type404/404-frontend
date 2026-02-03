import { PiHamburger } from "react-icons/pi";
import { LuBan } from "react-icons/lu";
import { TbFilterSearch } from "react-icons/tb";
import { FaPlus } from "react-icons/fa6";
import { IoMdSearch } from "react-icons/io";
import { PiForkKnife } from "react-icons/pi";
import { MdExitToApp } from "react-icons/md";

export const commonIcons = {
  hamburger: PiHamburger,
  ban: LuBan,
  filter: TbFilterSearch,
  plus: FaPlus,
  search: IoMdSearch,
  forkknife: PiForkKnife,
  exit: MdExitToApp,
  




} as const;

export type CommonIconName = keyof typeof commonIcons;
