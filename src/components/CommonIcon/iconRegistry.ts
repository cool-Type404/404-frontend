import { PiHamburger } from "react-icons/pi";
import { LuBan } from "react-icons/lu";
import { TbFilterSearch } from "react-icons/tb";
import { FaPlus } from "react-icons/fa6";
import { IoMdSearch } from "react-icons/io";
import { PiForkKnife } from "react-icons/pi";
import { MdExitToApp } from "react-icons/md";
import { IoPersonCircleOutline } from "react-icons/io5";
import { FiHome } from "react-icons/fi";
import { CiCircleCheck } from "react-icons/ci";
import { FaChevronDown } from "react-icons/fa6";
import { FaChevronLeft } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa6";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { SlLock } from "react-icons/sl";
import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";
import { LuScanFace } from "react-icons/lu";
import { FaBookmark } from "react-icons/fa6";
import { FaRegBookmark } from "react-icons/fa6";
import { CiMap } from "react-icons/ci";
import { RxCross1 } from "react-icons/rx";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";
import { BsFillHandThumbsUpFill } from "react-icons/bs";
import { BsHandThumbsUp } from "react-icons/bs";
import { FiPhone } from "react-icons/fi";
import { BiChair } from "react-icons/bi";
import { MdOutlineReviews } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaPerson } from "react-icons/fa6";
import { IoPeople } from "react-icons/io5";
import { FaPeopleGroup } from "react-icons/fa6";

export const iconRegistry = {
  hamburger: PiHamburger,
  ban: LuBan,
  filter: TbFilterSearch,
  plus: FaPlus,
  search: IoMdSearch,
  forkknife: PiForkKnife,
  exit: MdExitToApp,
  mypage: FiHome,
  mypage2: IoPersonCircleOutline,
  check: CiCircleCheck,
  downdir: FaChevronDown,
  leftdir: FaChevronLeft,
  rightdir: FaChevronRight,
  emailsign: MdOutlineAlternateEmail,
  passwordsign: SlLock,
  passwordopen: FaRegEye,
  passwordhide: FaRegEyeSlash,
  nickname: LuScanFace,
  bookmarkfiiled: FaBookmark,
  bookmarkline: FaRegBookmark,
  map: CiMap,
  crossclose: RxCross1,
  starline: FaRegStar,
  starfilled: FaStar,
  openinghour: MdAccessTime,
  thumbsupfilled: BsFillHandThumbsUpFill,
  thumbsupline: BsHandThumbsUp,
  phone: FiPhone,
  chair: BiChair,
  review: MdOutlineReviews,
  threedots: BsThreeDotsVertical,
  person: FaPerson,
  twopeople: IoPeople,
  peoplegroup: FaPeopleGroup,



} as const;

export type IconName = keyof typeof iconRegistry;
