import { HouseIcon, CalendarBlankIcon, IdentificationBadgeIcon, AddressBookIcon } from "@phosphor-icons/react";

const Sidebar =() => { 
    return (
        <sidebar className="col-2 bg-black h-100">
            <h1>Sidebar Component</h1>
            <ul>
                <li>
                    <IdentificationBadgeIcon size={24} color="yellow" />
                    <AddressBookIcon size={24} color="yellow" />
                    <HouseIcon size={24} color="yellow" weight="duotone" />
                    <CalendarBlankIcon size={24} color="yellow" weight="duotone" />
                    <span className="">Agendamentos</span>
                </li>
                <li>
                    <span className="">Clientes</span>
                </li>
            </ul>
        </sidebar>
    );
};

export default Sidebar;