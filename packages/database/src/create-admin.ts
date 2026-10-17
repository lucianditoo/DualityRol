import readline from "readline";
import bcrypt from "bcryptjs";
import { prisma, AdminRole } from "../src/index";

function askQuestion(query: string, hideText = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (hideText) {
      // Ocultar caracteres en pantalla para evitar que la contraseña quede visible
      process.stdout.write(query);
      let password = "";
      
      const onData = (char: Buffer) => {
        const str = char.toString("utf-8");
        switch (str) {
          case "\n":
          case "\r":
          case "\u0004":
            process.stdin.removeListener("data", onData);
            break;
          case "\u0003": // Ctrl+C
            process.exit();
            break;
          case "\u007f": // Backspace
          case "\b":
            if (password.length > 0) {
              password = password.slice(0, -1);
              process.stdout.write("\b \b");
            }
            break;
          default:
            password += str;
            process.stdout.write("*");
            break;
        }
      };

      process.stdin.on("data", onData);

      rl.question("", () => {
        process.stdout.write("\n");
        rl.close();
        resolve(password.trim());
      });
    } else {
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

async function main() {
  console.log("\n============================================================");
  console.log(" DUALITY ROL — INICIALIZACIÓN DEL PRIMER ADMINISTRADOR");
  console.log("============================================================\n");

  const emailInput = await askQuestion("Ingresá el correo electrónico del administrador: ");
  const normalizedEmail = emailInput.toLowerCase().trim();

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    console.error("❌ Correo electrónico inválido.");
    process.exit(1);
  }

  // Verificar si ya existe el usuario
  const existingUser = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    console.error(`❌ Ya existe un usuario administrador con el correo: ${normalizedEmail}`);
    process.exit(1);
  }

  const passwordInput = await askQuestion("Ingresá la contraseña (mínimo 8 caracteres): ", true);

  if (!passwordInput || passwordInput.length < 8) {
    console.error("❌ La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  const confirmPassword = await askQuestion("Confirmá la contraseña: ", true);

  if (passwordInput !== confirmPassword) {
    console.error("❌ Las contraseñas no coinciden.");
    process.exit(1);
  }

  console.log("\nGenerando hash seguro con bcryptjs (cost factor 12)...");
  const passwordHash = await bcrypt.hash(passwordInput, 12);

  const newUser = await prisma.adminUser.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role: AdminRole.SUPERADMIN,
      isActive: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      adminUserId: newUser.id,
      action: "INITIAL_ADMIN_CREATED",
      entity: "AdminUser",
      entityId: newUser.id,
      details: { email: normalizedEmail, role: "SUPERADMIN" },
    },
  });

  console.log("\n✅ Administrador creado exitosamente:");
  console.log(`- ID: ${newUser.id}`);
  console.log(`- Email: ${newUser.email}`);
  console.log(`- Rol: ${newUser.role}`);
  console.log("\nYa podés iniciar sesión en http://127.0.0.1:3001/login\n");
}

main()
  .catch((e) => {
    console.error("Error al crear administrador:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
