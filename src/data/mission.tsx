import type { ReactNode } from "react";
import {
  MissionPlusIcon,
  MissionListIcon,
  MissionBookIcon,
  MissionPeopleIcon,
  MissionPinIcon,
  MissionPulseIcon,
} from "@/components/icons/MissionIcons";

export type MissionItem = {
  num: string;
  icon: ReactNode;
  title: string;
  text: string;
};

export const missionItems: MissionItem[] = [
  {
    num: "M / 01",
    icon: <MissionPlusIcon />,
    title: "Стандарты",
    text: "Разработка и адаптация клинических рекомендаций по сосудистому доступу для российской практики.",
  },
  {
    num: "M / 02",
    icon: <MissionListIcon />,
    title: "Образование",
    text: "Очные и онлайн-курсы, симуляционные тренинги, мастер-классы для врачей и медсестёр.",
  },
  {
    num: "M / 03",
    icon: <MissionBookIcon />,
    title: "Исследования",
    text: "Поддержка мультицентровых исследований, регистров, публикаций в рецензируемых журналах.",
  },
  {
    num: "M / 04",
    icon: <MissionPeopleIcon />,
    title: "Сообщество",
    text: "Площадка для обмена опытом — конференции, рабочие группы, наставничество.",
  },
  {
    num: "M / 05",
    icon: <MissionPinIcon />,
    title: "Регионы",
    text: "Развитие компетенций в регионах: выездные школы, телементорство, локальные отделения.",
  },
  {
    num: "M / 06",
    icon: <MissionPulseIcon />,
    title: "Безопасность пациента",
    text: "Снижение частоты осложнений, аудит практик, поддержка отчётности и обратной связи.",
  },
];
