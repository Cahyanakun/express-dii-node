import { AppDataSource } from "./config/data-source";
import { User } from "./models/User";
import { Role } from "./models/Role";
import { Menu } from "./models/Menu";
import bcrypt from "bcrypt";

const seed = async () => {
    try {
        console.log("Starting seeding process...");
        await AppDataSource.initialize();
        console.log("Database initialized!");

        const userRepository = AppDataSource.getRepository(User);
        const roleRepository = AppDataSource.getRepository(Role);
        const menuRepository = AppDataSource.getRepository(Menu);

        console.log("Cleaning up database...");
        await AppDataSource.query('TRUNCATE TABLE "users", "roles", "menus", "user_roles", "role_menus" RESTART IDENTITY CASCADE');
        console.log("Database cleaned!");

        console.log("Seeding Menus...");
        
        const mDashboard = menuRepository.create({ label: "Dashboard", route: "/dashboard", sort_order: 1 });
        const mUserMgmt = menuRepository.create({ label: "User Management", route: "/users", sort_order: 2 });
        const mFinance = menuRepository.create({ label: "Finance", route: "/finance", sort_order: 3 });
        
        await menuRepository.save([mDashboard, mUserMgmt, mFinance]);

        const mAddUser = menuRepository.create({ 
            label: "Add User", 
            route: "/users/add", 
            parent: mUserMgmt, 
            sort_order: 1 
        });
        
        const mPayroll = menuRepository.create({ 
            label: "Payroll", 
            route: "/finance/payroll", 
            parent: mFinance, 
            sort_order: 1 
        });

        await menuRepository.save([mAddUser, mPayroll]);


        console.log("Seeding Roles...");
        
        const rSuperAdmin = roleRepository.create({
            role_name: "Super Admin",
            description: "Has access to everything",
            menus: [mDashboard, mUserMgmt, mAddUser, mFinance, mPayroll]
        });

        const rFinanceManager = roleRepository.create({
            role_name: "Finance Manager",
            description: "Manages financial data",
            menus: [mDashboard, mFinance, mPayroll]
        });

        await roleRepository.save([rSuperAdmin, rFinanceManager]);
        console.log("Roles seeded successfully!");

        console.log("Seeding User...");
        
        const hashedPassword = await bcrypt.hash("password123", 10);
        
        const user = userRepository.create({
            username: "admin",
            email: "admin@mail.com",
            password: hashedPassword,
            roles: [rSuperAdmin, rFinanceManager]
        });

        const user2 = userRepository.create({
            username: "financeUser",
            email: "finance_user@mail.com",
            password: hashedPassword,
            roles: [rFinanceManager]
        });

        await userRepository.save([user, user2]);
        console.log("User seeded successfully!");

        console.log("Seeding complete!");

        await AppDataSource.destroy();
    } catch (error) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }
};

seed();
