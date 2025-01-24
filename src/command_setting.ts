class CommandSetting {
    /**
     * Return whether the bot should be admin on the chat.
     */
    public adminPrivileges: boolean = false;

    /**
     * Return whether the command can only be used by an admin.
     */
    public adminOnly: boolean = false;

    /**
     * Return whether the command can only be used by the owner.
     */
    public ownerOnly: boolean = false;

    /**
     * Return whether the command can be used in a private chat.
     */
    public onPrivateChat: boolean = true;

    /**
     * Return whether the command can be used in a group chat.
     */
    public onGroupChat: boolean = true;

    /**
     * Return whether the command is active.
     */
    public active: boolean = true;
}

export default CommandSetting;
