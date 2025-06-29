import { Contact } from "@prisma/client";
import { prisma } from "../lib/prisma";

export async function upsertContact(contact: Partial<Contact>): Promise<Contact> {
  return prisma.contact.upsert({
    where: {
      id: contact.id || undefined,
      jid: contact.jid || undefined,
      lid: contact.lid || undefined,
      phoneNumber: contact.phoneNumber || undefined,
    },
    update: contact,
    create: contact,
  });
}
