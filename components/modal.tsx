'use client';
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
export default function Modal({open,onClose,title,description,children,className=''}:{open:boolean;onClose:()=>void;title:string;description:string;children:React.ReactNode;className?:string}) {
  return <Dialog.Root open={open} onOpenChange={v=>{if(!v)onClose()}}><Dialog.Portal><Dialog.Overlay className="modal-overlay"/><Dialog.Content className={`modal ${className}`}><Dialog.Title className="modal-title">{title}</Dialog.Title><Dialog.Description className="modal-description">{description}</Dialog.Description><Dialog.Close className="icon-button modal-close" aria-label="Cerrar"><X size={22}/></Dialog.Close>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
