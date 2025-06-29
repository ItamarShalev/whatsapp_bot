import { Contact, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export async function upsertContact(contact: Partial<Contact>): Promise<Contact> {
  const { id, jid, lid, phoneNumber } = contact;

  let where: Prisma.ContactWhereUniqueInput = {
    id: undefined,
    jid: undefined,
    lid: undefined,
    phoneNumber: undefined,
  };

  if (id) {
    where.id = id;
  } else if (jid) {
    where.jid = jid;
  } else if (lid) {
    where.lid = lid;
  } else if (phoneNumber) {
    where.phoneNumber = phoneNumber;
  } else {
    throw new Error(
      "At least one unique identifier (id, jid, lid, or phoneNumber) must be provided."
    );
  }

  return prisma.contact.upsert({
    where,
    update: contact,
    create: contact,
  });
}
