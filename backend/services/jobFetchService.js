/**
 * jobFetchService.js
 * ─────────────────────────────────────────────────────────────────────
 * Provider pattern for fetching job descriptions.
 * Priority: JSearch → Adzuna → Arbeitnow → Curated Fallback DB
 *
 * The fallback DB covers 10 major companies × 5 roles each = 50 JDs.
 * The system NEVER returns empty results.
 *
 * To add a new provider: implement the interface and add to PROVIDERS array.
 */

// ─── Curated Fallback Job Description Database ────────────────────────
// 50 high-quality JDs across top Indian and global tech companies.
const JD_DATABASE = {
  'Google': {
    'Software Engineer': `Google is looking for a Software Engineer to join our team. You will design and build the next generation of Google technologies. Requirements: Strong proficiency in one or more of: Java, C++, Python, Go. Experience with distributed systems, large-scale infrastructure, and data structures. BS/MS in Computer Science or equivalent. 2+ years of experience. Knowledge of algorithms, operating systems, and software engineering principles. Experience with cloud platforms (GCP preferred). Familiarity with system design principles, microservices, and RESTful APIs. Strong problem-solving skills and ability to work in an Agile environment.`,

    'Data Scientist': `We are seeking a Data Scientist to work on cutting-edge machine learning problems at Google scale. Requirements: MS/PhD in Statistics, Computer Science, or quantitative field. Proficiency in Python, R, or similar languages. Deep knowledge of machine learning algorithms (supervised, unsupervised, deep learning). Experience with TensorFlow, PyTorch, or scikit-learn. Strong SQL skills and experience with large datasets. Experience with data pipelines, feature engineering, A/B testing. Publications or research experience is a plus. Knowledge of NLP, computer vision, or recommendation systems preferred.`,

    'AI/ML Engineer': `Google Brain and DeepMind teams are seeking ML Engineers. Requirements: MS/PhD in Machine Learning, AI, or Computer Science. Expert Python skills with TensorFlow or JAX. Deep understanding of neural network architectures (CNN, RNN, Transformers). Experience with large-scale distributed training. Strong mathematical background in linear algebra, probability, optimization. Familiarity with MLOps, model deployment, and monitoring. Experience with reinforcement learning, generative AI, or LLMs is a strong plus. Publications in top ML venues preferred.`,

    'Frontend Developer': `Google is hiring Frontend Engineers to build beautiful, performant user interfaces. Requirements: 3+ years of experience with JavaScript, TypeScript, HTML5, CSS3. Proficiency in React, Angular, or Vue.js. Experience with build tools: Webpack, Vite, Babel. Strong understanding of web performance optimization, accessibility (WCAG), and responsive design. Experience with RESTful APIs and GraphQL. Knowledge of testing frameworks (Jest, Cypress). Familiarity with Material Design or Google design systems. Understanding of browser rendering and Core Web Vitals.`,

    'DevOps Engineer': `We are looking for a DevOps Engineer to maintain and improve Google's CI/CD infrastructure. Requirements: 3+ years of DevOps/SRE experience. Strong knowledge of Kubernetes, Docker, and container orchestration. Experience with GCP, AWS, or Azure. Proficiency in Terraform, Ansible, or Chef for infrastructure as code. Strong Linux/Unix administration skills. Experience with monitoring tools (Prometheus, Grafana, Stackdriver). Knowledge of CI/CD pipelines (Jenkins, GitLab CI, GitHub Actions). Strong scripting skills in Python, Bash. Understanding of SLO/SLI/SRE principles.`
  },

  'Microsoft': {
    'Software Engineer': `Microsoft is seeking a Software Engineer to build innovative products used by millions. Requirements: BS/MS in Computer Science or related field. Proficiency in C#, Java, Python, or C++. Experience with .NET, Azure services, and Microsoft technologies. Strong understanding of data structures, algorithms, and object-oriented design. Experience with cloud architecture, microservices, and REST APIs. Familiarity with DevOps practices and CI/CD pipelines. Knowledge of Azure DevOps, GitHub Actions. Experience with Agile/Scrum methodologies. Good communication and teamwork skills.`,

    'Data Scientist': `Join Microsoft AI to build data-driven products. Requirements: MS/PhD in Data Science, Statistics, or Computer Science. Strong Python, R, and SQL skills. Experience with Azure Machine Learning, Databricks, or similar. Knowledge of statistical modeling, feature engineering, and A/B testing. Familiarity with Power BI for visualization. Experience with MLOps practices and model deployment. Understanding of NLP and time-series analysis. Azure certifications are a plus.`,

    'AI/ML Engineer': `Microsoft is building next-generation AI products with Azure OpenAI. Requirements: 3+ years ML engineering experience. Proficiency in Python, PyTorch, or TensorFlow. Experience with LLMs, prompt engineering, and fine-tuning. Knowledge of Azure ML platform and deployment pipelines. Understanding of responsible AI principles. Experience with vector databases, semantic search. Strong mathematical foundations. Azure AI certifications preferred.`,

    'Cloud Architect': `Microsoft Azure team needs Cloud Solution Architects. Requirements: 5+ years of cloud architecture experience. Deep expertise in Azure services (Compute, Storage, Networking, Security). Azure Solutions Architect Expert certification required. Experience with hybrid cloud, identity management (Azure AD). Knowledge of disaster recovery, high availability patterns. Strong IaC skills with Terraform or ARM templates. Ability to conduct architectural reviews and workshops. Experience migrating enterprise workloads to cloud.`,

    'Product Manager': `Drive Microsoft's product vision and strategy. Requirements: MBA or BS in CS with 4+ years PM experience. Strong analytical skills with data-driven decision making. Experience with Agile methodologies and roadmap planning. Excellent communication and stakeholder management. Technical background to collaborate effectively with engineering. Experience with user research, A/B testing, market analysis. Knowledge of Microsoft product ecosystem preferred.`
  },

  'Amazon': {
    'Software Development Engineer': `Amazon SDEs build systems that serve hundreds of millions of customers. Requirements: BS/MS in Computer Science. Strong Java, Python, or C++ skills. Excellent understanding of data structures, algorithms, and system design. Experience with distributed systems and microservices. Knowledge of AWS services (EC2, S3, Lambda, DynamoDB). Experience with Agile development and TDD. Ability to drive code reviews and mentor junior engineers. Strong problem-solving and OOP design skills. Familiarity with CI/CD, containerization.`,

    'Data Engineer': `Build and maintain Amazon's data infrastructure. Requirements: 3+ years data engineering experience. Proficiency in Python, Scala, or Java. Strong SQL and NoSQL database skills. Experience with AWS data services (Redshift, Glue, EMR, Kinesis). Knowledge of data pipeline frameworks (Apache Spark, Kafka). Experience with data modeling, ETL design, and data quality. Familiarity with dbt, Airflow, or similar orchestration tools. Understanding of data lake and data warehouse architecture.`,

    'ML Engineer': `Amazon AI/ML teams build recommendation systems, forecasting, and more. Requirements: MS in ML/CS or 4+ years ML engineering experience. Strong Python skills with SageMaker, TensorFlow, or PyTorch. Experience with feature engineering, model training, and deployment. Knowledge of A/B testing and experimentation frameworks. Experience with distributed training and large-scale inference. Understanding of NLP, computer vision, or ranking systems. AWS ML certifications preferred.`,

    'DevOps/SRE': `AWS Site Reliability Engineering team. Requirements: 4+ years SRE/DevOps experience. Expert knowledge of AWS services and cloud architecture. Strong scripting skills (Python, Bash, Go). Experience with Kubernetes, Docker, Terraform. Familiarity with monitoring (CloudWatch, Datadog, PagerDuty). Knowledge of incident management, post-mortems, and capacity planning. Understanding of networking, DNS, load balancing. AWS certifications highly desired.`,

    'Frontend Engineer': `Build Amazon's customer-facing web experiences. Requirements: 3+ years frontend engineering experience. Expert JavaScript/TypeScript, React skills. Experience with performance optimization for e-commerce scale. Knowledge of A/B testing frameworks. Familiarity with accessibility standards. Experience with server-side rendering (Next.js). Strong CSS, responsive design skills. Knowledge of SEO and Core Web Vitals.`
  },

  'Infosys': {
    'Software Engineer': `Infosys is hiring Software Engineers for enterprise application development. Requirements: BE/B.Tech in Computer Science or IT. Proficiency in Java, Python, or C#. Experience with Spring Boot, Hibernate, or .NET. Knowledge of relational databases (Oracle, MySQL, PostgreSQL). Understanding of SDLC, Agile methodologies. Good communication skills for client interaction. Familiarity with JIRA, Git. Exposure to cloud platforms is a plus. 0-3 years of experience. Strong analytical and problem-solving skills.`,

    'Data Analyst': `Join Infosys Digital team as a Data Analyst. Requirements: B.Tech/MCA in CS or related field. Strong SQL skills and experience with large datasets. Proficiency in Python or R for data analysis. Experience with Tableau, Power BI, or similar visualization tools. Knowledge of statistical methods and data interpretation. Excel advanced skills. Understanding of data governance and quality. Good communication for presenting insights to stakeholders. Experience with ETL processes is a plus.`,

    'Full Stack Developer': `Infosys digital transformation projects require Full Stack Developers. Requirements: 2+ years full stack experience. Proficiency in React or Angular for frontend. Node.js or Java Spring Boot for backend. SQL and NoSQL database experience. RESTful API design and development. Experience with Git, Docker basics. Knowledge of Agile/Scrum. AWS or Azure basics preferred. Good problem-solving and teamwork skills.`,

    'Testing Engineer': `Quality Assurance Engineers for enterprise software projects. Requirements: B.Tech in CS or IT. Experience with manual and automated testing. Proficiency in Selenium, TestNG, or similar tools. Knowledge of Java or Python for test automation. Understanding of JIRA for defect tracking. Familiarity with Agile testing methodologies. API testing with Postman or REST-assured. Database testing skills (SQL). Good analytical and documentation skills.`,

    'Cloud Engineer': `Infosys Cloud practice is expanding. Requirements: 2+ years cloud experience. AWS, Azure, or GCP certified preferred. Knowledge of cloud migration strategies. Experience with containerization (Docker, Kubernetes). IaC experience with Terraform or CloudFormation. Linux administration skills. Monitoring and logging experience. Understanding of cloud security best practices. Networking knowledge (VPC, Load Balancers).`
  },

  'TCS': {
    'Software Engineer': `Tata Consultancy Services hiring for multiple technology domains. Requirements: B.E/B.Tech/MCA with minimum 60% aggregate. Strong programming skills in Java, Python, C++, or C#. Knowledge of data structures and algorithms. Good communication skills (written and verbal). Willingness to work in any location. CGPA 6.5 and above preferred. Freshers and 0-2 years experienced candidates. Knowledge of databases (SQL). Aptitude for learning new technologies quickly. Team player with positive attitude.`,

    'Data Scientist': `TCS AI/ML Center of Excellence hiring Data Scientists. Requirements: M.Tech/MS in Data Science or Computer Science. Strong Python skills with Pandas, NumPy, Scikit-learn. Machine learning algorithm expertise. SQL and data manipulation skills. Experience with deep learning (TensorFlow/PyTorch). Data visualization (Matplotlib, Seaborn, Tableau). Statistical modeling and hypothesis testing. NLP or computer vision experience is a plus. Strong communication for client-facing projects.`,

    'Cyber Security Analyst': `TCS Cybersecurity practice team. Requirements: B.Tech in CS/IT with security certifications. CEH, CISSP, or CompTIA Security+ preferred. Knowledge of SIEM tools (Splunk, IBM QRadar). Vulnerability assessment and penetration testing experience. Understanding of network security, firewalls, IDS/IPS. Incident response and forensics knowledge. Compliance frameworks (ISO 27001, GDPR, SOC2). Strong analytical and report writing skills.`,

    'DevOps Engineer': `TCS DevOps and Cloud team. Requirements: 2+ years DevOps experience. Docker and Kubernetes expertise. CI/CD pipelines with Jenkins or GitLab. AWS/Azure certified preferred. Terraform or Ansible for IaC. Linux/Unix administration. Monitoring with Nagios, Prometheus, or Grafana. Version control with Git. Strong scripting skills (Bash, Python). Agile and SAFe methodology experience.`,

    'Business Analyst': `TCS consulting and business analysis roles. Requirements: MBA or B.Tech with business analysis skills. Requirement gathering and documentation expertise. UML, process flow diagrams. Proficiency in JIRA, Confluence. Strong SQL for data analysis. Excellent communication and stakeholder management. Experience with Agile BA practices. Knowledge of BFSI, healthcare, or retail domains preferred. Presentation skills for client workshops.`
  },

  'Wipro': {
    'Software Developer': `Wipro Technologies looking for passionate developers. Requirements: B.E/B.Tech in CS, IT, or ECE. Good knowledge of Java or Python or C++. Understanding of OOP concepts. Knowledge of SQL databases. Familiarity with web technologies (HTML, CSS, JavaScript basics). Good problem-solving skills. Willingness to learn and adapt to new technologies. 60% aggregate throughout academics. Team-oriented with good communication skills.`,

    'Data Engineer': `Wipro Analytics team hiring Data Engineers. Requirements: 3+ years data engineering experience. Strong Python and PySpark skills. SQL expertise with complex queries and optimization. Experience with Hadoop ecosystem, Hive, Kafka. Cloud data platforms (Azure Synapse, AWS Glue). Data pipeline development and orchestration. Data modeling and warehouse design. ETL tools experience. Git version control. Problem-solving and analytical mindset.`,

    'ML Engineer': `Wipro AI and ML practice. Requirements: B.Tech/M.Tech in CS with ML specialization. Python proficiency with ML libraries. Experience with model training, validation, deployment. Knowledge of cloud ML platforms. Familiarity with MLOps practices. Basic understanding of data preprocessing and feature engineering. Good mathematical foundations (linear algebra, statistics). Deep learning frameworks (TensorFlow or PyTorch). Communication skills for project coordination.`,

    'Full Stack Developer': `Wipro digital services team. Requirements: 2-4 years full stack development experience. React.js or Angular frontend expertise. Node.js or Java Spring Boot backend. MongoDB or PostgreSQL database skills. REST API development. Git and CI/CD familiarity. Agile development experience. Good communication for daily standups and client demos. Problem-solving approach to debugging.`,

    'Cloud Consultant': `Wipro Cloud practice expanding. Requirements: 3+ years cloud consulting experience. Multi-cloud expertise (AWS, Azure, GCP). Solutions architecture and migration experience. Cloud security and compliance knowledge. IaC with Terraform, ARM, or CDK. Cost optimization and FinOps experience. Strong client presentation and consulting skills. Cloud certifications highly preferred. Documentation and proposal writing skills.`
  },

  'Zoho': {
    'Software Engineer': `Zoho is looking for engineers to build world-class SaaS products. Requirements: B.E/B.Tech in CS or related field. Strong Java or C++ skills (Zoho uses these heavily). Good understanding of data structures, algorithms, and system design. Experience with web development (HTML, CSS, JS). Relational database knowledge (SQL). Problem-solving aptitude and competitive programming background preferred. Self-motivated with desire to build products from scratch. No prior experience required for freshers — strong fundamentals matter most.`,

    'Frontend Developer': `Build Zoho's suite of 40+ business apps. Requirements: 2+ years frontend experience. Expert JavaScript skills (vanilla and framework). React, Vue, or Angular experience. CSS mastery and responsive design. Performance optimization skills. Cross-browser compatibility expertise. Experience with REST APIs. Understanding of UX principles. Git version control. Strong debugging and problem-solving skills.`,

    'Data Analyst': `Zoho Analytics team. Requirements: Strong SQL querying skills. Python or R for data analysis. Experience with BI tools (Zoho Analytics, Tableau preferred). Statistical analysis and data storytelling skills. Excel advanced usage. Understanding of business metrics and KPIs. Data quality and governance awareness. Good presentation and communication skills for stakeholder reporting.`,

    'Backend Developer': `Zoho infrastructure and backend services team. Requirements: 3+ years backend development. Java, Python, or Node.js expertise. Microservices architecture experience. Database design and optimization (MySQL, PostgreSQL). Redis, Kafka, or message queue experience. RESTful and GraphQL API design. Performance tuning and scalability experience. Linux and server administration basics. Security best practices knowledge.`,

    'Mobile Developer': `Zoho mobile apps team. Requirements: iOS (Swift/Objective-C) or Android (Kotlin/Java) experience. 2+ years mobile development. Understanding of mobile UX patterns. REST API integration. App store submission experience. Knowledge of device compatibility and performance optimization. Git version control. Debugging and profiling tools experience. Bonus: cross-platform experience (React Native or Flutter).`
  },

  'Freshworks': {
    'Software Engineer': `Freshworks is building customer experience software used globally. Requirements: B.E/B.Tech or equivalent in CS. Strong Ruby on Rails, Java, or Python skills. Experience with MySQL, PostgreSQL, and Redis. Familiarity with microservices and API-first design. Knowledge of cloud platforms (AWS). Git and CI/CD experience. Agile methodology experience. Good communication skills. Passion for building products at scale.`,

    'Frontend Engineer': `Freshworks product teams need exceptional frontend engineers. Requirements: 2+ years frontend experience. React.js expertise (hooks, context, performance). TypeScript proficiency. CSS/SCSS and design system implementation. RESTful API and WebSocket integration. Performance optimization (lazy loading, code splitting). Testing with Jest and React Testing Library. Accessibility standards knowledge. Cross-browser compatibility.`,

    'Data Scientist': `Freshworks AI-powered customer support features. Requirements: MS in CS/Data Science or 2+ years experience. Python with Pandas, NumPy, Scikit-learn. NLP experience (text classification, sentiment analysis). Machine learning model training and evaluation. SQL proficiency. A/B testing and experimentation. Model deployment experience. Good communication for cross-functional collaboration.`,

    'DevOps Engineer': `Freshworks SRE and infrastructure team. Requirements: 3+ years DevOps experience. AWS expertise (EC2, ECS, RDS, S3). Kubernetes and Docker proficiency. Terraform for infrastructure as code. CI/CD with GitHub Actions or Jenkins. Monitoring with Datadog or Prometheus. On-call experience and incident management. Linux administration. Python or Go scripting. Cost optimization mindset.`,

    'Product Manager': `Drive Freshworks product direction. Requirements: 3+ years product management. Technical background (engineering degree preferred). Experience with CRM or SaaS products. Data-driven decision making. User research and customer empathy. Roadmap planning and Agile execution. Strong writing and communication. Stakeholder alignment across design, engineering, and sales.`
  },

  'Flipkart': {
    'Software Development Engineer': `Flipkart is India's leading e-commerce company, building technology at incredible scale. Requirements: BS/MS in Computer Science. Strong Java or Scala skills. Experience with distributed systems and microservices. Knowledge of e-commerce domain (catalog, payments, logistics preferred). MySQL, Cassandra, or HBase experience. Kafka or similar message streaming knowledge. REST API design. CI/CD and DevOps familiarity. Strong algorithms and data structures.`,

    'Data Engineer': `Flipkart data platform team. Requirements: 3+ years data engineering experience. Strong Python and PySpark. SQL and NoSQL database expertise. Hadoop ecosystem knowledge (Hive, HDFS). Real-time data processing with Kafka or Flink. Data pipeline orchestration (Airflow). Experience with data warehouse design. Performance optimization of Spark jobs. Familiarity with Presto or Druid.`,

    'ML Engineer': `Flipkart's AI team builds recommendation, search ranking, and demand forecasting. Requirements: M.Tech/MS in ML/CS or 3+ years experience. Strong Python with TensorFlow or PyTorch. Experience with recommendation systems or search ranking. Large-scale model training and deployment. Feature stores and ML pipelines. A/B testing framework experience. Knowledge of online learning or real-time inference. Research paper reading and implementation ability.`,

    'Frontend Engineer': `Flipkart web and mobile web experiences. Requirements: 3+ years frontend engineering. Expert React.js skills with server-side rendering. Performance optimization for mobile-first, low-bandwidth experience. JavaScript/TypeScript expert. CSS animation and responsive design. Experience with micro-frontends. Webpack and build optimization. Strong debugging and profiling skills.`,

    'Cloud/Infrastructure Engineer': `Flipkart private cloud and infrastructure team. Requirements: 4+ years infrastructure experience. OpenStack or on-premise cloud experience. Kubernetes and container orchestration. Network architecture and SDN knowledge. Storage systems (Ceph, NFS). Automation with Python and Ansible. Capacity planning and performance engineering. Linux kernel and system administration expertise.`
  },

  'Swiggy': {
    'Backend Engineer': `Swiggy is India's largest food delivery platform with millions of daily orders. Requirements: 2+ years backend engineering experience. Strong Python, Java, or Go skills. Microservices architecture with high availability requirements. PostgreSQL, MySQL, or DynamoDB experience. Redis for caching and session management. Kafka for event streaming. REST and gRPC API design. Docker and Kubernetes. Handling 10x traffic spikes and on-call readiness. Performance-oriented mindset.`,

    'Data Scientist': `Swiggy's data science team powers demand forecasting, personalization, and logistics optimization. Requirements: MS in quantitative field or 2+ years experience. Strong Python skills (Pandas, NumPy, Scikit-learn). Experience with time-series forecasting or recommendation systems. SQL and large dataset handling. A/B experimentation. Model deployment experience. Knowledge of geospatial analysis or logistics optimization is a plus. Communication skills for business stakeholder alignment.`,

    'Mobile Engineer': `Swiggy's consumer and partner apps. Requirements: 3+ years Android (Kotlin) or iOS (Swift) experience. Jetpack Compose or SwiftUI experience preferred. Clean architecture (MVVM, MVP). RESTful API integration. Push notifications, maps, location services. App performance optimization. Firebase integration. CI/CD for mobile (Bitrise or Fastlane). Unit and UI testing. Strong debugging skills.`,

    'DevOps/SRE': `Swiggy infrastructure reliability team. Requirements: 3+ years SRE/DevOps experience. AWS or GCP cloud expertise. Kubernetes cluster management. Terraform for infrastructure provisioning. Prometheus, Grafana, PagerDuty for monitoring/alerting. On-call experience with SLO/SLA ownership. Database reliability (PostgreSQL, MongoDB). CDN and networking knowledge. Incident response and runbook creation. Cost engineering mindset.`,

    'Frontend Engineer': `Swiggy web platform (web ordering, Swiggy Instamart). Requirements: 3+ years React.js experience. TypeScript proficiency. Next.js and server-side rendering. Performance optimization (LCP, FID, CLS improvements). Progressive Web App development. Payment gateway integration experience. A/B testing with feature flags. Design system implementation. Accessibility and cross-device compatibility.`
  }
};

// ─── Provider Interface ───────────────────────────────────────────────────
// Each provider must implement: { name, fetch(company, role) }
// Returns: { description: string, source: string } | null

/**
 * JSearch Provider (via RapidAPI)
 * Requires: JSEARCH_API_KEY environment variable
 * Uncomment when key is available.
 */
const jsearchProvider = {
  name: 'jsearch',
  fetch: async (company, role) => {
    const apiKey = process.env.JSEARCH_API_KEY;
    if (!apiKey) return null;

    try {
      const query = encodeURIComponent(`${role} ${company}`);
      const response = await fetch(
        `https://jsearch.p.rapidapi.com/search?query=${query}&page=1&num_pages=1`,
        {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
          },
          signal: AbortSignal.timeout(5000)
        }
      );
      if (!response.ok) return null;
      const data = await response.json();
      const job = data?.data?.[0];
      if (!job?.job_description) return null;
      return { description: job.job_description, source: 'jsearch' };
    } catch {
      return null;
    }
  }
};

/**
 * Adzuna Provider
 * Requires: ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables
 */
const adzunaProvider = {
  name: 'adzuna',
  fetch: async (company, role) => {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    if (!appId || !appKey) return null;

    try {
      const query = encodeURIComponent(`${role} at ${company}`);
      const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=1&what=${query}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) return null;
      const data = await response.json();
      const job = data?.results?.[0];
      if (!job?.description) return null;
      return { description: job.description, source: 'adzuna' };
    } catch {
      return null;
    }
  }
};

/**
 * Arbeitnow Provider (Free, no key required)
 */
const arbeitnowProvider = {
  name: 'arbeitnow',
  fetch: async (company, role) => {
    try {
      const query = encodeURIComponent(role);
      const url = `https://www.arbeitnow.com/api/job-board-api?search=${query}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) return null;
      const data = await response.json();
      const job = data?.data?.find(j =>
        j.title?.toLowerCase().includes(role.toLowerCase()) ||
        j.company_name?.toLowerCase().includes(company.toLowerCase())
      );
      if (!job?.description) return null;
      // Arbeitnow descriptions may contain HTML — strip basic tags
      const plainText = job.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return { description: plainText, source: 'arbeitnow' };
    } catch {
      return null;
    }
  }
};

// ─── Ordered Provider Chain ────────────────────────────────────────────────
const PROVIDERS = [jsearchProvider, adzunaProvider, arbeitnowProvider];

// ─── Fuzzy Company Matcher ─────────────────────────────────────────────────
const findBestCompanyMatch = (company) => {
  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const companyNorm = normalize(company);
  const dbKeys = Object.keys(JD_DATABASE);
  // Exact match
  const exact = dbKeys.find(k => normalize(k) === companyNorm);
  if (exact) return exact;
  // Partial match
  const partial = dbKeys.find(k => companyNorm.includes(normalize(k)) || normalize(k).includes(companyNorm));
  return partial || null;
};

// ─── Fuzzy Role Matcher ────────────────────────────────────────────────────
const findBestRoleMatch = (companyKey, role) => {
  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const roleNorm = normalize(role);
  const roles = Object.keys(JD_DATABASE[companyKey] || {});

  const exact = roles.find(r => normalize(r) === roleNorm);
  if (exact) return exact;

  const partial = roles.find(r => roleNorm.includes(normalize(r)) || normalize(r).includes(roleNorm));
  if (partial) return partial;

  // Token-based match: find role with most matching words
  const roleWords = role.toLowerCase().split(/\s+/);
  let bestScore = 0;
  let bestRole = roles[0]; // fallback to first role
  roles.forEach(r => {
    const rWords = r.toLowerCase().split(/\s+/);
    const score = roleWords.filter(w => rWords.some(rw => rw.includes(w) || w.includes(rw))).length;
    if (score > bestScore) { bestScore = score; bestRole = r; }
  });

  return bestRole;
};

// ─── Generic Fallback JD Generator ─────────────────────────────────────────
const generateGenericJD = (company, role) => {
  return `${company} is seeking a talented ${role} to join our growing team.

Key Responsibilities:
• Design, develop, and maintain software applications and systems
• Collaborate with cross-functional teams to define, design, and ship new features
• Identify and correct bottlenecks, fix bugs, and improve application performance
• Write clean, maintainable, and efficient code following best practices
• Participate in code reviews and technical discussions

Required Skills and Qualifications:
• Bachelor's or Master's degree in Computer Science, Engineering, or a related field
• 0-4 years of professional software development experience
• Strong programming skills in relevant technologies
• Experience with modern development tools and version control (Git)
• Knowledge of software development life cycle and Agile/Scrum methodologies
• Strong problem-solving skills and attention to detail
• Excellent communication and teamwork abilities

Preferred Qualifications:
• Experience with cloud platforms (AWS, Azure, or GCP)
• Familiarity with containerization technologies (Docker, Kubernetes)
• Knowledge of CI/CD pipelines and DevOps practices
• Relevant industry certifications
• Open source contributions or personal project portfolio

What We Offer:
• Competitive salary and benefits
• Opportunities for professional growth and learning
• Collaborative and innovative work environment`;
};

// ─── Main Export Function ──────────────────────────────────────────────────

/**
 * Fetch the best available job description for a given company + role.
 * Tries live API providers first, falls back to curated DB, then generates generic.
 */
const fetchJobDescription = async (company, role) => {
  // 1. Try live API providers (in order)
  for (const provider of PROVIDERS) {
    try {
      const result = await provider.fetch(company, role);
      if (result && result.description && result.description.length > 100) {
        console.log(`[JobFetch] Fetched from provider: ${provider.name}`);
        return { ...result, usedFallback: false };
      }
    } catch (err) {
      console.warn(`[JobFetch] Provider ${provider.name} failed:`, err.message);
    }
  }

  // 2. Fallback to curated DB
  const companyKey = findBestCompanyMatch(company);
  if (companyKey) {
    const roleKey = findBestRoleMatch(companyKey, role);
    if (roleKey && JD_DATABASE[companyKey][roleKey]) {
      console.log(`[JobFetch] Using fallback DB: ${companyKey} > ${roleKey}`);
      return {
        description: JD_DATABASE[companyKey][roleKey],
        source: 'fallback_db',
        usedFallback: true,
        matchedCompany: companyKey,
        matchedRole: roleKey
      };
    }
  }

  // 3. Generic fallback — always returns something
  console.log(`[JobFetch] Using generated generic JD for: ${company} > ${role}`);
  return {
    description: generateGenericJD(company, role),
    source: 'fallback_db',
    usedFallback: true
  };
};

/**
 * Get the list of companies available in the fallback DB.
 */
const getAvailableCompanies = () => Object.keys(JD_DATABASE);

/**
 * Get the list of roles for a specific company in the fallback DB.
 */
const getRolesForCompany = (company) => {
  const companyKey = findBestCompanyMatch(company);
  if (!companyKey) return [];
  return Object.keys(JD_DATABASE[companyKey] || {});
};

module.exports = {
  fetchJobDescription,
  getAvailableCompanies,
  getRolesForCompany,
  JD_DATABASE
};
